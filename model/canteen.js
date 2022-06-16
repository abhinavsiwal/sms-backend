//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var canteenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    menu: [
      {
        type: ObjectId,
        ref: "menu",
      },
    ],
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    start_time: {
      type: String,
      trim: true,
    },
    end_time: {
      type: String,
      trim: true,
    },
    staff: [
      {
        type: ObjectId,
        ref: "staff",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("canteen", canteenSchema);
