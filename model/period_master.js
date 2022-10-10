//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var periodSchema = new mongoose.Schema(
  {
    class: {
      type: ObjectId,
      ref: "class",
      required: true,
    },
    section: {
        type: ObjectId,
        ref: "section",
    },
    day: {
        type: String
    },
    start: {
      type: String
    },
    end: {
        type: String
    },
    type: {
        type: String,
        required: true,
        default: "P",
        enum: ["P", "R"]
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    updated_by: {
        type: ObjectId,
        ref: "staff",
        required: true,
      },
    is_active: {
        type: String,
        required: true,
        default: "Y",
        enum: ["Y", "N"]
    },
    is_deleted: {
        type: String,
        required: true,
        default: "N",
        enum: ["Y", "N"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("period_master", periodSchema);
