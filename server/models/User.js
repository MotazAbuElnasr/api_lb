const Nexmo = require("nexmo");
const sgMail = require("@sendgrid/mail");
const uuidv1 = require("uuid/v1");
const util = require("util");
const { checkUserErrors } = require("../helpers/validators");
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
    console.log("connect");
    const phoneExist = await User.findOne({ where: { phoneNumber } });
    const emailExist = await User.findOne({ where: { email } });
    const usernameExist = await User.findOne({ where: { username } });
    phoneExist ? userErrors.push("phone") : "";
    emailExist ? userErrors.push("email") : "";
    usernameExist ? userErrors.push("username") : "";
    if (userErrors.length !== 0) {
      return Promise.reject({
        statusCode: 200,
        message: "errors",
        errors: userErrors
      });
    } else {
      const number = phoneNumber.slice(1);
      const { request_id: requestID } = await nexmo.verify.request({
        number: "201095747099", //! api send free sms to the registered number
        brand: "Nexmo",
        code_length: "4"
      });
      console.log(requestID);
      ctx.args.data = { ...ctx.args.data, requestID };
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
        return Promise.reject({
          statusCode: 200,
          message: "errors",
          errors: ["Phone is already verified"]
        });
      }
      return Promise.reject({
        statusCode: 200,
        message: "errors",
        errors: ["Code is not correct"]
      });
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

  User.sendMail = function(email, callback) {
    var result = true;
    // TODO
    callback(null, result);
  };

  User.confirmEmail = async function(token) {
    const user = await User.findOne({ where: { token } });
    if (user) {
      // ? Token is expired in 2 days
      const verficationDate = user.verficationDate;
      const diffTime = Math.abs(Date.now() - verficationDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (user.emailVerified || diffDays > 2) {
        return "Expired";
      }
      await user.updateAttribute("emailVerified", true);
      return "Completed";
    }
    return "Incorrect";
  };
  User.afterRemote("confirmEmail", (context, result, next) => {
    const { result: verficationResult } = result;
    const actions = {
      Expired: {
        statusCode: 200,
        message: "errors",
        errors: ["This token is expired"]
      },
      Incorrect: {
        statusCode: 200,
        message: "errors",
        errors: ["This token is incorrect"]
      },
      Completed: {}
    };
    if (actions[verficationResult].errors) {
      next(actions[verficationResult]);
    } else {
      next();
    }
  });
  // ? Login
  User.beforeRemote("login", async (ctx, mdl) => {
    const email = ctx.req.body.email;
    const user = await User.findOne({ where: { email } });
  });
};
