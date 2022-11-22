//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var classSchema = new mongoose.Schema(
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
    session: {
      type: ObjectId,
      ref: "session",
      required: true,
    },
    section: [
      {
        type: ObjectId,
        ref: "section",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("class", classSchema);
