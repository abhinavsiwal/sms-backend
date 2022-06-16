//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var staffAttendanceSchema = new mongoose.Schema(
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
      required: true,
      ref: "session",
    },
    school: {
      type: ObjectId,
      required: true,
      ref: "schooldetail",
    },
    staff: {
      type: ObjectId,
      required: true,
      ref: "staff",
    },
    department:{
      type:ObjectId,
      required:true,
      ref:"Department",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("staffAttendance", staffAttendanceSchema);
