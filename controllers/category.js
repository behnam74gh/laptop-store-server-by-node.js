const Category = require("../models/categry");
const Sub = require("../models/sub");
const slugify = require("slugify");
const Product = require("../models/product");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const createdCategory = await new Category({
      name,
      slug: slugify(name),
    }).save();
    res.json(createdCategory);
  } catch (err) {
    res.status(400).json("create category faild!");
  }
};

exports.list = async (req, res) =>
  res.json(await Category.find({}).sort({ createdAt: -1 }).exec());

exports.read = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).exec();
  // res.json(category);

  const products = await Product.find({ category }).populate("category").exec();
  res.json({ category, products });
};

exports.update = async (req, res) => {
  const { name } = req.body;
  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).send("category update faild!");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (error) {
    res.status(400).json("deleting category faild!");
  }
};

exports.getSubs = (req, res) => {
  Sub.find({ parent: req.params._id }).exec((err, subs) => {
    if (err) console.log(err);
    res.json(subs);
  });
};
