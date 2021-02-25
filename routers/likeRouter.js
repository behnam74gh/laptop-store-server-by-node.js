const express = require("express");
const Dislike = require("../models/DislikeComment.js");
const Like = require("../models/LikeComment.js");

const router = express.Router();

router.post("/like/getLikes", async (req, res) => {
  try {
    const likes = await Like.find({ commentId: req.body.commentId }).exec();
    res.json({ success: true, likes });
  } catch (error) {
    console.log("daliiiiii --->", error);
    res.status(500).json({ success: false, error });
  }
});

router.post("/like/uplike", async (req, res) => {
  try {
    //add like information to db
    await new Like(req.body).save();
    //if dislike button already cliked ,we needto decrease the dislike by 1
    await Dislike.findOneAndDelete({
      commentId: req.body.commentId,
    }).exec();
    res.json({ success: true });
  } catch (error) {
    console.log("daliiiiii --->", error);
    res.status(500).json({ success: false, error });
  }
});

router.post("/like/unlike", async (req, res) => {
  try {
    await Like.findOneAndDelete({
      commentId: req.body.commentId,
    }).exec();
    res.json({ success: true });
  } catch (error) {
    console.log("daliiiiii --->", error);
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
