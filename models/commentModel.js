const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    writer: {
      type: ObjectId,
      ref: "User",
    },
    postId: {
      type: ObjectId,
      ref: "Product",
    },
    responseTo: {
      type: ObjectId,
      ref: "User",
    },
    content: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
