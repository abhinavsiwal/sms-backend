//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    class: {
      type: ObjectId,
      ref: "class",
    },
    amount: {
      type: Number,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    applicable_from: {
        type: Date,
        trim: true,
        required: true,
    },
    applicable_to: {
        type: Date,
        trim: true,
        required: true,
    },
    fees_applicable: [{
      type: ObjectId,
      ref: "fees_sub_management",
      required: true,
    }],
    school: {
        type: ObjectId,
        ref: "schooldetail",
        required: true,
    },
    is_active: {
        type: String,
        required: true,
        default: "Y",
        enum: ["Y", "N"]
    },
    is_deleted: {
        type: String,
        required: true,
        default: "N",
        enum: ["Y", "N"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("coupon_master", couponSchema);
