const User = require("../models/user");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middlewares/util");

//register
exports.register = async (req, res) => {
  const { email } = req.body;
  // console.log(email);
  const existUser = await User.findOne({ email: email }).exec();
  if (existUser) {
    res.json({ success: false, errorMessage: "email already exist!" });
  }

  //email content
  const output = `
    <h3 style="color: red">laptop Ecommerce authentication</h3>
    <p>is this your email? are you sure?</p>
    <a href='http://localhost:3000/register/complete'>yeah...its me</a>
  `;

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports - for ssl => https
    auth: {
      user: "zack.kuhlman@ethereal.email", // generated ethereal user
      pass: "F8rcb31yWp5qxRRKsQ", // generated ethereal password
    },
    tls: {
      //if you are not in internet and trying in localhost
      rejectUnauthorized: false,
    },
  });

  let info = await transporter.sendMail({
    from: '"the software engineer Behnam-qazaqi" <laptopecommerce@example.com>',
    to: `${email}`,
    subject: "User Authentication ✔",
    text: "is this your email?",
    html: output,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  res.json({
    success: true,
    message: "please authenticate by checking your email!",
  });
};

//registerComplete
exports.registerComplete = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPass = bcrypt.hashSync(password, 8);

  const newUser = await new User({
    name: name,
    email: email,
    password: hashedPass,
  }).save();

  res.status(201).json({
    success: true,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    _id: newUser._id,
    token: generateToken(newUser),
  });
};

//login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const currentUser = await User.findOne({ email: email }).exec();

  if (currentUser && bcrypt.compareSync(password, currentUser.password)) {
    res.json({
      success: true,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      _id: currentUser._id,
      token: generateToken(currentUser),
    });
  }
  res.json({ success: false, errorMessage: "invalid email or password!" });
};

//changePassword
exports.changePassword = async (req, res) => {
  const { newPass } = req.body;
  try {
    const hashedNewPass = bcrypt.hashSync(newPass, 8);

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      { password: hashedNewPass },
      { new: true }
    ).exec();
    res.json({ message: "password updated correctly!" });
  } catch (error) {
    console.log(error);
  }
};
