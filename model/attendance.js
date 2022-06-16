//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var attendanceSchema = new mongoose.Schema(
  {
    attendance_status: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    session: {
      type: ObjectId,
      // required: true,
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
      ref: "section",
    },
    school: {
      type: ObjectId,
      // required: true,
      ref: "schooldetail",
    },
    student: {
      type: ObjectId,
      required: true,
      ref: "student",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("attendance", attendanceSchema);
