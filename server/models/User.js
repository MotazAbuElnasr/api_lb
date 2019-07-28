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
  const sendMail = async email => {
    const user = await User.findOne({ email });
    if (user) {
      const emailToken = uuidv1();
      await user.updateAttribute("emailToken", emailToken);
      sgMail.setApiKey(SENDGRED_KEY);
      const msg = {
        to: email,
        from: "lb.media@lb.com",
        subject: "Please verify your email",
        html: `
        <a href="http://${domain}/api/users/confirmEmail?token=${emailToken}">Please click here link to verify</a>`
      };
      await sgMail.send(msg); //! uncomment that
      return emailToken;
    }
    return false;
  };

  User.beforeRemote("create", async function(ctx, obj) {
    const user = ctx.req.body;
    const { phoneNumber, email, username } = user;
    const userErrors = checkUserErrors(user);
    if (!(phoneNumber && email && username)) {
      throw new CustomError(400, "VERFICATION", "invalid inputs", userErrors);
    }
    const phoneExist = await User.findOne({ where: { phoneNumber } });
    const emailExist = await User.findOne({ where: { email } });
    const usernameExist = await User.findOne({ where: { username } });
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
      console.log(requestID);
      ctx.args.data = { ...ctx.args.data, requestID };
      ctx.instance.unsetAttribute("confirmPassword");

      console.log(ctx.args.data);
      // TODO **DONE** Send the request id to the user back
    }
  });

  // Add remote method for confirming phone number
  User.confirmPhone = async function({ code, requestID }) {
    // ?The api call to confirm the phone
    const result = await nexmo.verify.check({
      request_id: requestID,
      code: code
    });
    console.log(result);
    if (result.error_text) {
      // ?If the code is not correct
      if (result.status === "6") {
        throw new CustomError(
          400,
          "PHONE_VERIFIED",
          "Code has been already verified",
          null
        );
      }
      throw new CustomError(400, "INCORRECT_CODE", "Code is in correct", null);
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
  User.sendMail = async function(email) {
    const user = await User.findOne({ email });
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

  User.confirmEmail = async function(token) {
    const user = await User.findOne({ where: { token } });
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
  User.afterRemote("login", async (ctx, mdl) => {
    const { email, password, username } = ctx.req.body;
    if (!(password && (email || username))) {
      throw new CustomError(400, "LOGIN", "Invalid inputs", null);
    }
    const user = await User.findOne({ where: { email } });
    const {
      phoneVerified,
      emailVerified,
      firstName,
      lastName,
      phoneNumber
    } = user;
    if (!phoneVerified) {
      throw new CustomError(400, "UNVERIFIED_PHONE", "phone is unverified", {
        firstName,
        lastName,
        phoneNumber
      });
    }
    if (!emailVerified) {
      throw new CustomError(400, "UNVERIFIED_Email", "email is unverified", {
        firstName,
        lastName,
        phoneNumber
      });
    }
  });
};
