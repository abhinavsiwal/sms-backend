//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema
var supportSchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ["P1", "P2", "P3"],
      required: true,
      default: "P3",
    },
    SID: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "Acknowledged",
        "In Progress",
        "A waiting for user response",
        "Resolved",
      ],
      default: "In Progress",
    },
    root_caused: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("support", supportSchema);
