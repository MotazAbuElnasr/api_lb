const Nexmo = require("nexmo");
const sgMail = require("@sendgrid/mail");
const uuidv1 = require("uuid/v1");
const util = require("util");
const { checkUserErrors } = require("../helpers/validators");
const CustomError = require("../helpers/CustomError");
const domain = "localhost:3000";
const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API,
  apiSecret: process.env.NEXMO_SECRET
});
nexmo.verify.check = util.promisify(nexmo.verify.check);
nexmo.verify.request = util.promisify(nexmo.verify.request);
const SENDGRED_KEY = process.env.SENDGRID_KEY;
module.exports = function(User) {
  // !Remove unused methods
  User.disableRemoteMethodByName("prototype.__create__friends");
  User.disableRemoteMethodByName("prototype.__delete__friends");
  User.disableRemoteMethodByName("prototype.__findById__friends");
  User.disableRemoteMethodByName("prototype.__updateById__friends");
  User.disableRemoteMethodByName("prototype.__destroyById__friends");

  const sendMail = async email => {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const emailToken = uuidv1();
      await user.updateAttribute("emailToken", emailToken);
      sgMail.setApiKey(SENDGRED_KEY);
      const msg = {
        to: email,
        from: "lb.media@lb.com",
        subject: "Please verify your email",
        html: `
        <a href="http://${domain}/api/users/confirmEmail?emailToken=${emailToken}">Please click here link to verify</a>`
      };
      await sgMail.send(msg); //! uncomment that
      return emailToken;
    }
    return false;
  };

  User.beforeRemote("create", async function(ctx, obj) {
    console.log(ctx.req.body);
    const user = ctx.req.body;
    const { phoneNumber, email, username } = user;
    const userErrors = checkUserErrors(user);
    if (!(phoneNumber && email && username)) {
      throw new CustomError(400, "VERFICATION", "invalid inputs", userErrors);
    }
    console.log("connecting");
    const phoneExist = await User.findOne({ where: { phoneNumber } });
    const emailExist = await User.findOne({ where: { email } });
    const usernameExist = await User.findOne({ where: { username } });
    console.log("done");
    phoneExist ? userErrors.push("phone") : "";
    emailExist ? userErrors.push("email") : "";
    usernameExist ? userErrors.push("username") : "";
    if (userErrors.length !== 0) {
      throw new CustomError(400, "VERFICATION", "invalid inputs", userErrors);
    } else {
      const number = phoneNumber.slice(1);
      const { request_id: requestID } = await nexmo.verify.request({
        number: "201095747099", //! api send free sms to the registered number
        brand: "Nexmo",
        code_length: "4"
      });
      ctx.args.data = { ...ctx.args.data, requestID, codeDate: Date.now() };
      // TODO **DONE** Send the request id to the user back
    }
  });

  User.observe("before save", function removeConfirmPassField(ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.unsetAttribute("confirmPassword");
    }
    next();
  });
  //? Resend confirmation number
  User.resendCode = async function(id) {
    const user = await User.findOne({ where: { id } });
    const number = user.phoneNumber.slice(1);
    const { request_id: requestID } = await nexmo.verify.request({
      number: "201095747099", //! api send free sms to the registered number
      brand: "Nexmo",
      code_length: "4"
    });
    await user.updateAttributes({ requestID });
    return requestID;
  };

  // Add remote method for confirming phone number
  User.confirmPhone = async function({ code, requestID }) {
    if (!code || !requestID) {
      throw new CustomError(400, "INCORRECT_CODE", "No code is sent", null);
    }
    // ?The api call to confirm the phone
    const result = await nexmo.verify.check({
      request_id: requestID,
      code: code
    });
    if (result.error_text) {
      // ?If the code is not correct
      if (result.status === "6") {
        throw new CustomError(400, "CODE_EXPIRED", "Code is expired", null);
      }
      if (result.status === "17") {
        throw new CustomError(
          400,
          "CODE_ERROR",
          "Wrong code was provided many times",
          null
        );
      }
      throw new CustomError(400, "INCORRECT_CODE", "Code is incorrect", null);
    } else {
      // ? If the code is correct
      const verifiedUser = await User.findOne({
        where: { requestID }
      });
      // ? SENDING EMAIL DONE
      const email = verifiedUser.email;
      const emailToken = await sendMail(email);
      await verifiedUser.updateAttributes({
        phoneVerified: true,
        verficationDate: Date.now(),
        emailToken
      });
    }
    return "Verfication done";
  };

  // TODO : ADD change email option
  User.resendMail = async function(email) {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const emailToken = await sendMail(email);
      await user.updateAttributes({
        phoneVerified: true,
        verficationDate: Date.now(),
        emailToken
      });
      return "Verfication done";
    }
    return "error";
  };

  User.confirmEmail = async function(emailToken) {
    const user = await User.findOne({ where: { emailToken } });
    if (user) {
      // ? Token is expired in 2 days
      const verficationDate = user.verficationDate;
      const diffTime = Math.abs(Date.now() - verficationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (user.emailVerified || diffDays > 2) {
        throw new CustomError(
          400,
          "EXPIRED_TOKEN",
          "The provided token is expired",
          null
        );
      }
      await user.updateAttribute("emailVerified", true);
      return "Completed";
    }
    throw new CustomError(
      400,
      "INCORRECT_TOKEN",
      "The provided token is incorrect",
      null
    );
  };
  // ? Login
  User.beforeRemote("login", async ctx => {
    const { email, password, username } = ctx.req.body;
    if (!(password && (email || username))) {
      throw new CustomError(
        400,
        "INVALID_LOGIN",
        "Credentials are incorre",
        null
      );
    }
    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    }
    if (username && !email) {
      user = await User.findOne({ where: { username } });
    }
    if (!user) {
      throw new CustomError(400, "INVALID_LOGIN", "Credentials are incorrect");
    }
    const isMatched = await user.hasPassword(password);
    if (!isMatched) {
      throw new CustomError(400, "INVALID_LOGIN", "Credentials are incorrect");
    }
    const {
      phoneVerified,
      emailVerified,
      firstName,
      lastName,
      phoneNumber,
      codeDate,
      id
    } = user;
    const diffTime = Math.abs(Date.now() - codeDate.getTime());
    const remainingTime = 300 - Math.ceil(diffTime / 1000);
    if (!phoneVerified) {
      throw new CustomError(400, "UNVERIFIED_PHONE", "phone is unverified", {
        firstName,
        lastName,
        phoneNumber,
        remainingTime,
        id
      });
    }
    if (!emailVerified) {
      throw new CustomError(400, "UNVERIFIED_Email", "email is unverified", {
        firstName,
        lastName,
        email
      });
    }
  });
  // ?restrict find all
  User.beforeRemote("find", function(ctx, remoteResult, next) {
    ctx.args.filter = {
      ...ctx.args.filter,
      fields: ["id", "firstName", "lastName"]
    };
    next();
  });
  //? scope posts for user
  User.beforeRemote("prototype.__get__posts", async function(
    ctx,
    remoteResult
  ) {
    ctx.args.filter = {
      ...ctx.args.filter,
      fields: { userId: false },
      include: {
        relation: "user",
        scope: { fields: ["firstName", "lastName"] }
      }
    };
  });
};
