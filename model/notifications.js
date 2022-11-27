//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var notifications = new mongoose.Schema(
{
    student: {
        type: ObjectId,
        ref: "student",
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: String,
        required: true,
        default: "N",
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

module.exports = mongoose.model("notifications", notifications);
