const express = require("express");

const { authCheck, adminCheck } = require("../middlewares/auth");

const { orders, orderStatus } = require("../controllers/admin");

const router = express.Router();

router.get("/admin/orders", authCheck, adminCheck, orders);
router.put("/admin/order-status", authCheck, adminCheck, orderStatus);

module.exports = router;
