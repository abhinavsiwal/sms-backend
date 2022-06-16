var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let leaveSchema = new mongoose.Schema(
  {
    leaveType:{
        type: String,
        trim: true,
    },

    dateFrom: {
      type: Date,
      required: true,
      trim: true,
    },
    dateTo: {
      type: Date,
      required: true,
      trim: true,
    },
    noOfDays: {
      type: Number,
    //   required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Awaiting",
      enum: ["Awaiting", "Approved", "Declined", "Cancelled"],
    },
    student: {
      type: ObjectId,
      ref: "student",
    },
    staff: {
      type: ObjectId,
      ref: "staff",
    },
    class:{
        type: ObjectId,
        ref: "class",
    },
    section:{
        type: ObjectId,
        ref: "section",
    },
    department:{
        type: ObjectId,
        ref: "Department",
    },
    type:{
        type: String,
        required: true,
    },
    school: {
      type: ObjectId,
      // required: true,
      ref: "schooldetail",
    },
    session:{
      type: ObjectId,
      ref: "session",
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model("leave", leaveSchema);