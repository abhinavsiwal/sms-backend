//import all require dependencies
var mongoose = require("mongoose");

//schema for superAdmin
var planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
    discount_price: {
      type: Number,
      trim: true,
      default: 0,
    },
    key_feature: {
      type: Array,
      required: true,
      trim: true,
    },
    discount_type: {
      type: String,
      trim: true,
    },
    discount_value: {
      type: Number,
      trim: true,
    },
    endDate: {
      type: Date,
      trim: true,
    },
    startDate: {
      type: Date,
      trim: true,
    },
    module: {
      type: Array,
      required: true,
      trim: true,
    },
    isDiscount:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
