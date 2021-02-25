const express = require("express");
const Dislike = require("../models/DislikeComment.js");
const Like = require("../models/LikeComment.js");

const router = express.Router();

router.post("/dislike/getdisLikes", async (req, res) => {
  try {
    const dislikes = await Dislike.find({
      commentId: req.body.commentId,
    }).exec();
    res.json({ success: true, dislikes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

router.post("/dislike/updislike", async (req, res) => {
  try {
    // console.log(req.body);
    //add dislike information to db
    await new Dislike(req.body).save();
    //if like button already cliked ,we needto decrease the like by 1
    await Like.findOneAndDelete({
      commentId: req.body.commentId,
    }).exec();
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

router.post("/dislike/undislike", async (req, res) => {
  try {
    await Dislike.findOneAndDelete({
      commentId: req.body.commentId,
    }).exec();
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error });
  }
});

module.exports = router;
