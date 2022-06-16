//import all require dependencies
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

const Category = require("../model/category");

exports.addCategory = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        }
        let category;
        try {
            category = await Category.create(fields);
        } catch (err) {
            console.log(err);
            return res.status(400).json({ err: "Error in creating Category" });
        }
        return res.status(200).json(category);
    });
};

exports.getAllCategories = async (req, res) => {
    let categories = [];
    try {
        categories = await Category.find({ school: req.schooldoc._id });
    } catch (er) {
        console.log(err);
        return res.status(500).json({ err: "Getting categories failed" });
    }
    res.status(200).json(categories);
};

exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    let category;
    try {
        category = await Category.findById(categoryId);
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ err: "Something went wrong in delete Category" });
    }
    if (!category) {
        return res.status(500).json({ err: "Could not find category for this id" });
    }
    try {
        await category.remove();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: "Product could not be deleted" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
};

exports.updateCategory = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async(err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        let category;
        try {
            category = await Category.findById(fields.id);

        } catch (err) {
            console.log(err);
            return res
                .status(500)
                .json({ err: "Something went wrong in getting Category" });
        }
        if (!category) {
            return res
                .status(404)
                .json({ err: "Could not find category for this id" });
        }
        try {
            category = await Category.findByIdAndUpdate(fields.id, fields, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ err: "Error in Updating Category" })
        }
        return res.status(200).json(category);
    });
};
