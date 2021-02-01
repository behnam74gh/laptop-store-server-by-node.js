const express = require("express");

//middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

//controllers
const { create, read, update, remove, list } = require("../controllers/sub");

const router = express.Router();

//routes
router.post("/sub", authCheck, adminCheck, create);
router.get("/subs", list);
router.get("/sub/:slug", read);
router.put("/sub/:slug", authCheck, adminCheck, update);
router.delete("/sub/:slug", authCheck, adminCheck, remove);

module.exports = router;
