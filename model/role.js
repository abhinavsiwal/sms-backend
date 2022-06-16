//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    permissions: {
      type: Object,
      trim: true,
    },
    delete: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("role", roleSchema);
