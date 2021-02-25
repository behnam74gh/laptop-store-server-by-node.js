const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, maxlength: [12, "Too long"] },
    email: {
      type: String,
      trim: true,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Too Short"],
      maxlength: [62, "Too Long"],
    },
    role: { type: String, default: "subscriber" },
    image: String,
    cart: { type: Array, default: [] },
    address: String,
    wishlist: [{ type: ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
