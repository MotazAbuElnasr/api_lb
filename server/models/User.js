const { checkUserErrors } = require("../helpers/validators");
const CustomError = require("../helpers/CustomError");
const { searchUsers, saveUser } = require("../helpers/esQueries");
const { getPosts, sendMail, nexmo } = require("../helpers/userHelpers");

module.exports = function(User) {
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
      ctx.args.data = { ...ctx.args.data, requestID, codeDate: Date.now() };
    }
  });

  User.afterRemote("create", async function(ctx, remoteResult) {
    const { id, firstName, lastName } = remoteResult;
    // ? saving to the elastic search cluster
    await saveUser({ id, firstName, lastName });
  });
  User.observe("before save", function removeConfirmPassField(ctx, next) {
    if (ctx.isNewInstance) {
      ctx.instance.unsetAttribute("confirmPassword");
    }
    next();
  });
  //? Resend confirmation number
  User.resendCode = async function(id) {
    const user = await User.findById(id);
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
  User.resendMail = async function(id) {
    const user = await User.findById(id);
    if (user) {
      const emailToken = await sendMail(user.email);
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
      throw new CustomError(400, "USER_NOT_FOUND", "User not found");
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
  User.afterRemote("login", async function(ctx, remoteResult) {
    const { firstName, lastName, username } = await User.findById(
      remoteResult.userId
    );
    ctx.result = { ...ctx.result.__data, firstName, lastName, username };
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
  // ! to be ommit
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

  User.searchUser = async function(q) {
    return searchUsers(q);
  };

  // * Handle friend requests
  // ? send friend request
  User.afterRemote("prototype.__link__sentRequests", async function(
    ctx,
    mdlRes
  ) {
    const userId = ctx.ctorArgs.id;
    const friendId = ctx.args.fk;
    const friend = await User.findById(friendId);
    await friend.receivedRequests.add(userId);
  });
  // ? cancel friend request
  User.afterRemote("prototype.__unlink__sentRequests", async function(
    ctx,
    mdlRes
  ) {
    const userId = ctx.ctorArgs.id;
    const friendId = ctx.args.fk;
    const friend = await User.findById(friendId);
    await friend.receivedRequests.remove(userId);
  });
  // ? Add friend
  // ? can't add himself
  User.beforeRemote("prototype.__link__friends", async function(ctx) {
    const userId = ctx.ctorArgs.id;
    const friendId = ctx.args.fk;
    const friend = await User.findById(friendId);
    const user = await User.findById(userId);
    ctx.user = user;
    ctx.friend = friend;
    if (!(user.id && friend.id)) {
      throw new CustomError(404, "USER_NOT_FOUND", "invalid user ids");
    }
    if (userId === friendId) {
      throw new CustomError(
        400,
        "INVALID_OPERATION",
        "Can't add your self as a friend"
      );
    }
  });
  User.afterRemote("prototype.__link__friends", async function(ctx, mdlRes) {
    try {
      const { user, friend } = ctx;
      await user.receivedRequests.remove(friend.id);
      await friend.sentRequests.remove(user.id);
      await friend.friends.add(user.id);
      ctx.result = {};
    } catch (error) {
      throw new CustomError(500, "SERVER_ERROR");
    }
  });

  // ? Reject friend request
  User.afterRemote("prototype.__unlink__receivedRequests", async function(
    ctx,
    mdlRes
  ) {
    const userId = ctx.ctorArgs.id;
    const friendId = ctx.args.fk;
    const friend = await User.findById(friendId);
    await friend.sentRequests.remove(userId);
  });

  // * Handling profile data

  User.afterRemote("findById", async function(ctx, remoteResult) {
    const currentUser = ctx.req.accessToken.userId.toJSON();
    const isFriend = await remoteResult.friends.exists(currentUser);
    const friends = await remoteResult.friends({
      limit: 5,
      fields: { firstName: true, lastName: true, id: true, username: true }
    });
    const posts = await getPosts(currentUser, remoteResult, 1, isFriend);
    const { id, firstName, lastName, username } = ctx.result.__data;
    ctx.result = {
      id,
      firstName,
      lastName,
      username,
      isFriend,
      posts,
      friends
    };
  });
  User.getPosts = async function(targetUser, page, req) {
    const currentUser = req.accessToken.userId;
    const user = await User.findById(targetUser);
    const isFriend = await user.friends.exists(currentUser);
    const posts = await getPosts(currentUser, user, page, isFriend);
    return posts;
  };
};
