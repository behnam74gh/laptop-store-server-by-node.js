const express = require("express");

//middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

//controllers
const { create, remove, list } = require("../controllers/coupon");

const router = express.Router();
//routers
router.post("/coupon", authCheck, adminCheck, create);
router.get("/coupons", list);
router.delete("/coupon/:couponId", authCheck, adminCheck, remove);

module.exports = router;
