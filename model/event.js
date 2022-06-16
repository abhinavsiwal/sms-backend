//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    event_from: {
      type: Date,
      required: true,
      trim: true,
    },
    session: {
      type: ObjectId,
      ref: "session",
      required: true,
    },
    event_to: {
      type: Date,
      required: true,
      trim: true,
    },
    event_type: {
      type: String,
      required: true,
      trim: true,
    },
    assignTeachers: {
      type: ObjectId,
      ref: "staff",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("event", eventSchema);
