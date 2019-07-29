"use strict";

module.exports = function(Post) {
  Post.afterRemote("find", function(ctx, remoteResult, next) {
    console.log(ctx);
    const { text } = remoteResult;
    ctx.result = { text };
  });
};
