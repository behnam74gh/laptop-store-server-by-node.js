const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const uniqueid = require("uniqueid");

exports.userCart = async (req, res) => {
  //get the cart from frontend
  const { cart } = req.body;
  let products = [];
  //who's sending this contents
  const user = await User.findOne({ email: req.user.email }).exec();
  //we must check..has he already a cart before? if he has... we must remove it!
  const existCartBefore = await Cart.findOne({ orderdBy: user._id }).exec();
  if (existCartBefore) {
    existCartBefore.remove();
    console.log("existCartBefore removed");
  }
  //then...we must create a new product by some data from db (for more security)
  for (let i = 0; i < cart.length; i++) {
    let object = {};

    object.product = cart[i]._id;
    object.count = cart[i].count;
    object.color = cart[i].color;
    //getting price from db for more security (user can change price in localstorage..we can't let him to do something like that!)
    const productFromDb = await Product.findById(cart[i]._id)
      .select("price")
      .exec();
    object.price = productFromDb.price;

    products.push(object);
  }
  // console.log('products', products);

  let cartTotal = 0;
  for (let i = 0; i < products.length; i++) {
    cartTotal = cartTotal + products[i].price * products[i].count;
  }
  //   console.log("cartTotal", cartTotal);

  let newCart = new Cart({
    products,
    cartTotal,
    orderdBy: user._id,
  }).save();

  console.log("newCart", newCart);

  res.json({ ok: true });
};

exports.getUserCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();

  const cart = await Cart.findOne({ orderdBy: user.id })
    .populate("products.product", "_id title price totalAfterDiscount")
    .exec();
  const { products, cartTotal, totalAfterDiscount } = cart;
  res.json({ products, cartTotal, totalAfterDiscount });
};

exports.emptyCart = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();
  const deletedCart = await Cart.findOneAndRemove({
    orderdBy: user._id,
  }).exec();
  res.json(deletedCart);
};

exports.saveAddress = async (req, res) => {
  const userAddress = await User.findOneAndUpdate(
    { email: req.user.email },
    { address: req.body.address }
  ).exec();
  res.json({ ok: true });
};

exports.applyCouponToUserCart = async (req, res) => {
  const { coupon } = req.body;
  // console.log('coupon from client --->', coupon);

  const validCoupon = await Coupon.findOne({ name: coupon }).exec();
  if (validCoupon === null) {
    res.json({ message: "invalid Coupons" });
  }
  // console.log(validCoupon);

  const user = await User.findOne({ email: req.user.email }).exec();

  const { products, cartTotal } = await Cart.findOne({
    orderdBy: user._id,
  }).populate("products.product", "_id title price");
  // console.log('cartTotal --->',cartTotal, 'discount % --->', validCoupon.discount);

  const totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);

  Cart.findOneAndUpdate(
    { orderdBy: user._id },
    { totalAfterDiscount },
    { new: true }
  ).exec();

  res.json(totalAfterDiscount);
};

//order Stripe
exports.createOrder = async (req, res) => {
  const { paymentIntent } = req.body.stripeResponse;

  const user = await User.findOne({ email: req.user.email }).exec();

  const { products } = await Cart.findOne({ orderdBy: user._id }).exec();

  const newOrder = await new Order({
    products,
    paymentIntent,
    orderdBy: user._id,
  }).save();
  console.log("newOrder----->", newOrder);

  const bulkOptions = products.map((item) => {
    return {
      //refer to products in Product collection
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOptions, {});
  //second parameters is {new: true} for sending new information from response
  console.log("PRODUCT QUANTITY-- AND SOLD++ ---------->", updated);

  res.json({ ok: true });
};

exports.orders = async (req, res) => {
  const user = await User.findOne({ email: req.user.email }).exec();

  const userOrders = await Order.find({ orderdBy: user._id })
    .populate("products.product")
    .exec();

  res.json(userOrders);
};
//COD
exports.createCashOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  //if COD is true ? create order with status Cash On Delivery

  if (!COD) return res.status(400).send("Create cash order failed!");

  const user = await User.findOne({ email: req.user.email }).exec();

  const userCart = await Cart.findOne({ orderdBy: user._id }).exec();

  let finalAmount = 0;

  if (couponApplied && userCart.totalAfterDiscount) {
    finalAmount = userCart.totalAfterDiscount * 100;
  } else {
    finalAmount = userCart.cartTotal * 100;
  }

  const newOrder = await new Order({
    products: userCart.products,
    paymentIntent: {
      id: uniqueid(),
      amount: finalAmount,
      currency: "usd",
      status: "Cash On Delivery",
      created: Date.now(),
      payment_method_types: ["cash"],
    },
    orderdBy: user._id,
    orderStatus: "Cash On Delivery",
  }).save();
  console.log("newOrder----->", newOrder);

  const bulkOptions = userCart.products.map((item) => {
    return {
      //refer to products in Product collection
      updateOne: {
        filter: { _id: item.product._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } },
      },
    };
  });

  let updated = await Product.bulkWrite(bulkOptions, {});
  //second parameters is {new: true} for sending new information from response
  console.log("PRODUCT QUANTITY-- AND SOLD++ ---------->", updated);

  res.json({ ok: true });
};

//wishlist

exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  //$addToSet-------> dont allow to duplicate(mongoose order)
  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $addToSet: { wishlist: productId } }
  ).exec();

  res.json({ ok: true });
};

exports.wishlist = async (req, res) => {
  const list = await User.findOne({ email: req.user.email })
    .select("wishlist")
    .populate("wishlist")
    .exec();

  res.json(list);
};

exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;

  const user = await User.findOneAndUpdate(
    { email: req.user.email },
    { $pull: { wishlist: productId } }
  ).exec();

  res.json({ ok: true });
};
