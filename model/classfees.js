//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var classfeesSchema = new mongoose.Schema(
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
    classfees: {
      type: Object,
      trim: true,
      required: true,
    },
    total:{
      type: Number,
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

module.exports = mongoose.model("classfees", classfeesSchema);
