//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var timetableSchema = new mongoose.Schema(
  {
    lecture: {
      type: Object,
      blackbox: true,
      required: true,
    },
    session: {
      type: ObjectId,
      required: true,
      ref: "session",
    },
    class: {
      type: ObjectId,
      required: true,
      ref: "class",
    },
    section: {
      type: ObjectId,
      required: true,
      unique: true,
      ref: "section",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    timeSlots: {
      type: Array,
      required: true,
      trim: true,
    },
    working_day: {
      type: Array,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("timetable", timetableSchema);
