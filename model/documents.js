//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var docuementsManagement = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    documents: [{
        type: String,
        trim: true,
    }],
    category: {
        type: String,
        required: true,
        default: "OtherDocs",
        enum: ["OtherDocs", "AdmissionDocs"]
    },
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
    department:{
        type: ObjectId,
        ref: "Department",
    },
    staff: {
        type: ObjectId,
        ref: "staff",
    },
    upload_date: {
        type: Date,
        default: Date.now(),
    },
    upload_by: {
        type: ObjectId,
        ref: "staff",
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

module.exports = mongoose.model("docuementsManagement", docuementsManagement);
