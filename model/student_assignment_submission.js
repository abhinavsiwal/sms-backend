//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var studentAssignmentSubmission = new mongoose.Schema(
{
    assignment: {
        type: ObjectId,
        ref: "assignment",
    },
    remarks: {
        type: String,
        trim: true,
    },
    document: {
        type: String,
        required: true,
        trim: true,
    },
    marks: {
        type: Number,
        trim: true,
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

module.exports = mongoose.model("studentAssignmentSubmission", studentAssignmentSubmission);
