//import all require dependencies
const _ = require("lodash");

//import require models
const Product = require("../../model/product");
const common = require("../../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Staff = require("../../model/staff");


exports.getProducts = async (req, res) => {
    let products = [];
    try {
        console.log(req.schooldoc._id)
        products = await Product.find({ school: ObjectId(req.schooldoc._id) });
        return common.sendJSONResponse(res, 1, "Products fetched successfully", products);
    } catch (err) {
        console.log(err);
        return common.sendJSONResponse(res, 0, "Problem in getting products. Please try again", null);
    }
};