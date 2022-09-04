//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    assignment_date: {
        type: Date,
        required: true,
        trim: true,
    },
    submission_date: {
        type: Date,
        required: true,
        trim: true,
    },
    marks: {
        type: Number,
        required: true,
        trim: true,
    },
    document: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        default: "A",
        enum: ["A", "I"]
    },
    student: [{
        type: ObjectId,
        ref: "student",
    }],
    class: {
        type: ObjectId,
        ref: "class",
    },
    section: {
        type: ObjectId,
        ref: "section",
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

module.exports = mongoose.model("assignment", AssignmentSchema);
