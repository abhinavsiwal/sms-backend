//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var menuSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    canteen: {
      type: ObjectId,
      ref: "canteen",
      required: true,
    },
    image: {
      type: String,
    },
    tempPhoto: {
      type: String,
      // required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    publish: {
      type: String,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("menu", menuSchema);
