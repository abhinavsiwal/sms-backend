//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var student_fees_collection = new mongoose.Schema(
    {
        month: {
            type: String,
            required: true,
            trim: true,
        },
        month_no: {
            type: Number,
            required: true,
            trim: true,
        },
        year: {
            type: Number,
            required: true,
            trim: true,
        },
        fees_id: {
            type: ObjectId,
            ref: "fees_management",
        },
        fees_sub_id: {
            type: ObjectId,
            ref: "fees_sub_management",
        },
        amount: {
            type: Number,
            required: true,
            trim: true,
        },
        total_amount: {
            type: Number,
            required: true,
            trim: true,
        },
        penalty: {
            type: Number,
            trim: true,
        },
        penalty_rate: {
            type: String,
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
        paid: {
            type: String,
            required: true,
            default: "N",
            enum: ["Y", "N"]
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

module.exports = mongoose.model("student_fees_collection", student_fees_collection);