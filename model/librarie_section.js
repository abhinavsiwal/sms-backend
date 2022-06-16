//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var LibrariesectionSchema = new mongoose.Schema(
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
    shelf: [
      {
        type: ObjectId,
        ref: "librarieshelf",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("librariesection", LibrariesectionSchema);
