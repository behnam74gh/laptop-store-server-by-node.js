const Product = require("../models/product");
const slugify = require("slugify");
const User = require("../models/user");
const { aggregate } = require("../models/product");

exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      subs,
      shipping,
      quantity,
      images,
      color,
      brand,
    } = req.body;
    const newProduct = await new Product({
      title,
      slug: slugify(title),
      description,
      price,
      category,
      subs,
      shipping,
      quantity,
      images,
      color,
      brand,
    }).save();
    res.json(newProduct);
  } catch (err) {
    // res.status(400).send("crating product faild!");
    res.status(400).json({ err: err.message });
    console.log(err);
  }
};

exports.listAll = async (req, res) => {
  const products = await Product.find({})
    .limit(Number(req.params.count))
    .populate("category")
    .populate("subs")
    .sort([["createdAt", "desc"]])
    .exec();
  res.json(products);
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      slug: req.params.slug,
    }).exec();
    res.json(deleted);
  } catch (err) {
    console.log(err);
    res.status(400).json("Product Delete faild!");
  }
};

exports.read = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category")
    .populate("subs")
    .exec();
  res.json(product);
};

exports.update = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updated = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      req.body,
      {
        new: true,
      }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "we can not sync data" });
  }
};

//Without-Pagination**************
// exports.list = async (req, res) => {
//   try {
//     const { sort, order, limit } = req.body;
//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();

//     res.json(products);
//   } catch (error) {
//     console.log(error);
//     res.status(400).send("there is a mistake!");
//   }
// };

//With-Pagination******************
exports.list = async (req, res) => {
  try {
    const { sort, order, page } = req.body;
    const currentPage = page || 1;
    const perPage = 3;

    const products = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(perPage)
      .exec();

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(400).send("there is a mistake!");
  }
};

exports.productsCount = async (req, res) => {
  const total = await Product.find({}).estimatedDocumentCount().exec(); //for getting count of products!
  res.json(total);
};

exports.productStar = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).exec();
    const user = await User.findOne({ email: req.user.email }).exec();
    const { star } = req.body;
    const existRatingObject = product.ratings.find(
      (r) => r.postedBy.toString() === user._id.toString()
    );

    if (existRatingObject === undefined) {
      let ratingAdded = await Product.findByIdAndUpdate(
        product._id,
        {
          $push: { ratings: { star, postedBy: user._id } },
        },
        { new: true }
      ).exec();
      console.log("ratingAdded", ratingAdded);
      res.json(ratingAdded);
    } else {
      const ratingUpdated = await Product.updateOne(
        {
          ratings: { $elemMatch: existRatingObject },
        },
        { $set: { "ratings.$.star": star } },
        { new: true }
      ).exec();
      res.json(ratingUpdated);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.listRelated = async (req, res) => {
  const product = await Product.findById(req.params.productId).exec();

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
  })
    .limit(3)
    .populate("category")
    .populate("subs")
    .populate("postedBy")
    .exec();
  res.json(related);
};

//searching functions
const handleQuery = async (req, res, query) => {
  const products = await Product.find({ $text: { $search: query } })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("postedBy", "_id name")
    .exec();

  res.json(products);
};

const handlePrice = async (req, res, price) => {
  try {
    let products = await Product.find({
      price: {
        $gte: price[0],
        $lte: price[1],
      },
    })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("postedBy", "_id name")
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleCategory = async (req, res, category) => {
  try {
    let products = await Product.find({ category })
      .populate("category", "_id name")
      .populate("subs", "_id name")
      .populate("postedBy", "_id name")
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

const handleStar = (req, res, stars) => {
  Product.aggregate([
    {
      $project: {
        document: "$$ROOT",
        // title: "$title",
        floorAverage: {
          $floor: { $avg: "$ratings.star" },
        },
      },
    },
    {
      $match: { floorAverage: stars },
    },
  ])
    .limit(12)
    .exec((err, aggregates) => {
      if (err) console.log("aggregate Error", err);
      Product.find({ _id: aggregates })
        .populate("category", "_id name")
        .populate("subs", "_id name")
        .populate("postedBy", "_id name")
        .exec((err, products) => {
          if (err) console.log("product Aggregate error", err);
          res.json(products);
        });
    });
};

const handleSub = async (req, res, sub) => {
  const products = await Product.find({ subs: sub })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("postedBy", "_id name")
    .exec();
  res.json(products);
};

const handleShipping = async (req, res, shipping) => {
  const products = await Product.find({ shipping })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("postedBy", "_id name")
    .exec();
  res.json(products);
};

const handleBrand = async (req, res, brand) => {
  const products = await Product.find({ brand })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("postedBy", "_id name")
    .exec();
  res.json(products);
};

const handleColor = async (req, res, color) => {
  const products = await Product.find({ color })
    .populate("category", "_id name")
    .populate("subs", "_id name")
    .populate("postedBy", "_id name")
    .exec();
  res.json(products);
};

//searching controller
exports.searchFilters = async (req, res) => {
  const {
    query,
    price,
    category,
    stars,
    sub,
    shipping,
    brand,
    color,
  } = req.body;

  if (query) {
    console.log("query", query);
    await handleQuery(req, res, query);
  }

  if (price !== undefined) {
    console.log("price --->", price);
    await handlePrice(req, res, price);
  }

  if (category) {
    console.log("category --->", category);
    await handleCategory(req, res, category);
  }

  if (stars) {
    console.log("stars --->", stars);
    await handleStar(req, res, stars);
  }

  if (sub) {
    console.log("sub --->", sub);
    await handleSub(req, res, sub);
  }

  if (shipping) {
    console.log("shipping --->", shipping);
    await handleShipping(req, res, shipping);
  }

  if (brand) {
    console.log("brand --->", brand);
    await handleBrand(req, res, brand);
  }

  if (color) {
    console.log("color --->", color);
    await handleColor(req, res, color);
  }
};
