//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

//schema for superAdmin
var subjectSchema = new mongoose.Schema(
  {
    list: {
      type: Array,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    session: {
      type: ObjectId,
      required: true,
      ref: "session",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("subject", subjectSchema);
