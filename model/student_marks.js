//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var studentMarks = new mongoose.Schema(
{
    exam: {
        type: ObjectId,
        ref: "examMaster",
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    marks: {
        type: Number,
        required: true,
        trim: true,
    },
    present: {
        type: String,
        required: true,
        default: "Y",
        enum: ["Y", "N"]
    },
    student: {
        type: ObjectId,
        ref: "student",
    },
    school: {
        type: ObjectId,
        ref: "schooldetail",
        required: true,
    },
    updatedBy: {
        type: ObjectId,
        ref: "staff",
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

module.exports = mongoose.model("studentMarks", studentMarks);
