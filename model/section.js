//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var sectionSchema = new mongoose.Schema(
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
    classTeacher: {
      type: ObjectId,
      ref: "staff",
    },
    class: {
      type: ObjectId,
      required: true,
      ref: "class",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
    subject: [
      {
        type: ObjectId,
        ref: "subject",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("section", sectionSchema);
