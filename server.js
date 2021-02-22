const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cros = require("cors");
const { readdirSync } = require("fs");
require("dotenv").config();

//app
const app = express();

//db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connected!");
  })
  .catch((err) => console.log(`DB Connection Faild ${err}`));

//middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cros());

//routes
readdirSync("./routers").map((r) => app.use("/api", require("./routers/" + r)));

//port
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`server running at ${port}`));
