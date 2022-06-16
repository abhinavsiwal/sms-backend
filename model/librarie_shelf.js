//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var shelfSchema = new mongoose.Schema(
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
    section: {
      type: ObjectId,
      required: true,
      ref: "librariesection",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("librarieshelf", shelfSchema);
