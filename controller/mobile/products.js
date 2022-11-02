//import all require dependencies
const _ = require("lodash");

//import require models
const Product = require("../../model/product");
const common = require("../../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Staff = require("../../model/staff");
const asyncLoop = require('node-async-loop');


exports.getProducts = async (req, res) => {
    let products = [];
    try {
        products = await Product.find({ school: ObjectId(req.schooldoc._id) });
        if (products && products.length > 0){
            var output = [];
            asyncLoop(products, function (item, next) { // It will be executed one by one
              if (item.image){
                common.getFileStreamCall(item.image, function(response){
                  output.push({ ...item.toObject(), image_url: response });
                  next();
                });
              } else {
                output.push({ ...item.toObject(), image_url: "" });
                next();
              }
            }, function (err) {
                return common.sendJSONResponse(res, 1, "Products fetched successfully", output);
            });
        } else {
            return common.sendJSONResponse(res, 2, "Products not available", null);
        }
    } catch (err) {
        console.log(err);
        return common.sendJSONResponse(res, 0, "Problem in getting products. Please try again", null);
    }
};