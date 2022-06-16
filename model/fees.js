//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var feesSchema = new mongoose.Schema(
  {
    class: {
      type: ObjectId,
      ref: "class",
      required: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    fees: {
      type: Object,
      trim: true,
      required: true,
    },
    fees_type: {
      type: String,
      trim: true,
      required: true,
    },
    session: {
      type: ObjectId,
      ref: "session",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("fees", feesSchema);
