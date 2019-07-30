"use strict";

module.exports = function(Post) {
  Post.beforeRemote("find", async function(ctx, remoteResult) {
    ctx.args.filter = {
      ...ctx.args.filter,
      include: {
        relation: "user",
        scope: { fields: ["firstName", "last Name"] }
      }
    };
  });
};
