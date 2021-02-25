const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const Schema = mongoose.Schema;

const likeSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User" },
    commentId: { type: ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", likeSchema);
