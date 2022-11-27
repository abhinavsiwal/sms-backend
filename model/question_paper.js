//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var question_paper = new mongoose.Schema(
{
    exam_paper_set: {
        type: String,
        required: true,
        trim: true,
    },
    total_marks: {
        type: Number,
        required: true,
        trim: true,
    },
    exam_date: {
        type: Date,
        required: true,
        trim: true,
    },
    questions: {
        type: String,
        required: true,
        trim: true,
    },
    class: {
        type: ObjectId,
        ref: "class",
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    subject_id: {
        type: ObjectId,
        ref: "subject",
    },
    session: {
        type: ObjectId,
        ref: "session",
        required: true,
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

module.exports = mongoose.model("question_paper", question_paper);
