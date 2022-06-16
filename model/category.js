//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },

    products: [
      {
        type: ObjectId,
        ref: "product",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("category", categorySchema);