const express = require("express");
const {
  register,
  registerComplete,
  login,
  changePassword,
} = require("../controllers/auth");

const { authCheck } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/registerComplete", registerComplete);
router.post("/login", login);
router.put("/changePassword", authCheck, changePassword);

module.exports = router;
