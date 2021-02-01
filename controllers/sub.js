const Sub = require("../models/sub");
const slugify = require("slugify");
const Product = require("../models/product");

exports.create = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const createdSub = await new Sub({
      name,
      parent,
      slug: slugify(name),
    }).save();
    res.json(createdSub);
  } catch (err) {
    res.status(400).json("create category faild!");
  }
};

exports.list = async (req, res) =>
  res.json(await Sub.find({}).sort({ createdAt: -1 }).exec());

exports.read = async (req, res) => {
  const sub = await Sub.findOne({ slug: req.params.slug }).exec();
  // res.json(sub);
  const products = await Product.find({ subs: sub })
    .populate("category")
    .exec();
  res.json({ sub, products });
};

exports.update = async (req, res) => {
  const { name, parent } = req.body;
  try {
    const updated = await Sub.findOneAndUpdate(
      { slug: req.params.slug },
      { name, parent, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).send("sub update faild!");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Sub.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (error) {
    res.status(400).json("deleting sub faild!");
  }
};
