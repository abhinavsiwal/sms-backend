//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var AvailFeesSchema = new mongoose.Schema(
  {
    student: {
        type: ObjectId,
        ref: "student",
    },
    total: {
        type: Number,
        required: true,
        trim: true,
    },
    from_date: {
        type: Date,
        required: true,
        trim: true,
    },
    to_date: {
        type: Date,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        trim: true,
    },
    avail: {
        type: String,
        required: true,
        default: "Y",
        enum: ["Y", "N"]
    },
    type: {
        type: String,
        required: true,
        default: "hostel",
        enum: ["hostel", "transport"]
    },
    class: {
        type: ObjectId,
        ref: "class",
    },
    section: {
        type: ObjectId,
        ref: "section",
    },
    session: {
        type: ObjectId,
        required: true,
        ref: "session",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
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

module.exports = mongoose.model("avail_fees", AvailFeesSchema);
