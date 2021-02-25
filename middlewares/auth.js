const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.authCheck = async (req, res, next) => {
  try {
    const authtoken = req.headers.authtoken;
    if (authtoken) {
      const token = authtoken.slice(7, authtoken.length);
      jwt.verify(
        token,
        process.env.JWT_SECRET || "ecommercesecret",
        (err, decode) => {
          if (err) {
            res.status(401).send({ message: "Invalid Token!" });
          } else {
            req.user = decode;
            next();
          }
        }
      );
    } else {
      res.status(401).send({ message: "No Token!" });
    }
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  const { email } = req.user;

  const adminUser = await User.findOne({ email }).exec();

  if (adminUser.role !== "admin") {
    res.status(403).json({
      err: "Admin resource. access denied",
    });
  } else {
    next();
  }
};

// const admin = require("../firebase");
// const User = require("../models/user");

// exports.authCheck = async (req, res, next) => {
//   try {
//     const firebaseUser = await admin
//       .auth()
//       .verifyIdToken(req.headers.authtoken);
//     req.user = firebaseUser;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       error: "Invalid or expired token",
//     });
//   }
// };

// exports.adminCheck = async (req, res, next) => {
//   const { email } = req.user;

//   const adminUser = await User.findOne({ email }).exec();

//   if (adminUser.role !== "admin") {
//     res.status(403).json({
//       err: "Admin resource. access denied",
//     });
//   } else {
//     next();
//   }
// };
