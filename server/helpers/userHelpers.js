// ? handle posts privacy
const sgMail = require("@sendgrid/mail");
const uuidv1 = require("uuid/v1");
const SENDGRED_KEY = process.env.SENDGRID_KEY;
const domain = "localhost:3000";
const Nexmo = require("nexmo");
const util = require("util");
const getPosts = async function(currentUser, targetUser, page, isFriend) {
  const POSTS_PER_REQUEST = 15;
  const postsToSkip = page > 0 ? (page - 1) * POSTS_PER_REQUEST : 0;
  let posts = await targetUser.posts.find();
  if (currentUser === targetUser.id.toJSON()) {
    posts = await targetUser.posts({
      limit: POSTS_PER_REQUEST,
      skip: postsToSkip
    });
    console.log(posts);
  } else if (isFriend) {
    posts = await targetUser.posts({
      where: { privacy: "friends" },
      limit: POSTS_PER_REQUEST,
      skip: postsToSkip
    });
  } else {
    posts = await targetUser.posts({
      where: { privacy: "public" },
      limit: POSTS_PER_REQUEST,
      skip: postsToSkip
    });
  }
  return posts;
};

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
        <a href="http://${domain}/verification-result?emailToken=${emailToken}">Please click here link to verify</a>`
    };
    await sgMail.send(msg); //! uncomment that
    return emailToken;
  }
  return false;
};
const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API,
  apiSecret: process.env.NEXMO_SECRET
});
nexmo.verify.check = util.promisify(nexmo.verify.check);
nexmo.verify.request = util.promisify(nexmo.verify.request);

module.exports = {
  sendMail,
  getPosts,
  nexmo
};
