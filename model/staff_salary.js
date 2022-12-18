//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var staff_salary = new mongoose.Schema(
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
        salary_credit: {
            type: Number,
            required: true,
            trim: true,
        },
        total_salary: {
            type: Number,
            required: true,
            trim: true,
        },
        basic_salary: {
            type: Number,
            trim: true,
        },
        lta: {
            type: Number,
            trim: true,
        },
        hra: {
            type: Number,
            trim: true,
        },
        professional_tax: {
            type: Number,
            trim: true,
        },
        others: {
            type: Number,
            trim: true,
        },
        leave_deductions: {
            type: Number,
            trim: true,
        },
        total_leaves: {
            type: Number,
            trim: true,
        },
        total_deductions: {
            type: Number,
            trim: true,
        },
        staff: {
            type: ObjectId,
            ref: "staff",
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

module.exports = mongoose.model("staff_salary", staff_salary);