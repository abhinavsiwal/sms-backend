//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var linkStudentSalaryWithStaff = new mongoose.Schema(
{
    class:{
        type: ObjectId,
        ref: "class",
    },
    section:{
        type: ObjectId,
        ref: "section",
    },
    student: {
        type: ObjectId,
        ref: "student",
    },
    staff: {
        type: ObjectId,
        ref: "staff",
    },
    one_time: {
        type: String,
        required: true,
        default: "Y",
        enum: ["Y", "N"]
    },
    recurring: {
        type: String,
        required: true,
        default: "Y",
        enum: ["Y", "N"]
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

module.exports = mongoose.model("linkStudentSalaryWithStaff", linkStudentSalaryWithStaff);
