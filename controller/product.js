const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

const Category = require("../model/category");
const Product = require("../model/product");

exports.addProduct = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let product;
    try {
      product = await Product.create(fields);
    } catch (err) { 
      console.log(err);
      return res.status(400).json({ err: "Error in creating Product" });
    }
    return res.status(200).json(product);
  });
};

exports.getAllProducts = async (req, res) => {
  let products = []; 
  try {
    products = await Product.find({ school: req.schooldoc._id });
  } catch (er) {
    console.log(err);
    return res.status(500).json({ err: "Getting categories failed" });
  }
  res.status(200).json(products);
};

exports.deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  let product;
  try {
    product = await Product.findById(productId);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ err: "Something went wrong in delete Product" });
  }
  if (!product) {
    return res.status(500).json({ err: "Could not find product for this id" });
  }
  try {
    await product.remove();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Product could not be deleted" });
  }
  res.status(200).json({ message: "Product deleted successfully" });
};

exports.updateProduct = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async(err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        let product;
        try {
            product = await Product.findById(fields.id);

        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ err: "Something went wrong in getting Product" });
        }
        if (!product) {
            return res
                .status(404)
                .json({ err: "Could not find product for this id" });
        }
        try {
            product = await Product.findByIdAndUpdate(fields.id, fields, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ err: "Error in Updating Product" })
        }
        return res.status(200).json(product);
    });
};
