//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var staffAttandance = new mongoose.Schema(
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
    staff: {
        type: ObjectId,
        required: true,
        ref: "staff",
    },
    department:{
        type:ObjectId,
        required:true,
        ref:"Department",
    },
    school: {
      type: ObjectId,
      // required: true,
      ref: "schooldetail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("staff_attandance", staffAttandance);
