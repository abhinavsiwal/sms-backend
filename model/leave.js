var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let leaveSchema = new mongoose.Schema(
    {
        leaveType: {
            type: String,
            trim: true,
            enum: ["EL", "LOP", "COMPOFF"],
        },
        dateFrom: {
            type: Date,
            required: true,
            trim: true,
        },
        dateTo: {
            type: Date,
            required: true,
            trim: true,
        },
        noOfDays: {
            type: Number,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            default: "Awaiting",
            enum: ["Awaiting", "Approved", "Declined", "Cancelled"],
        },
        student: {
            type: ObjectId,
            ref: "student",
        },
        staff: {
            type: ObjectId,
            ref: "staff",
        },
        class: {
            type: ObjectId,
            ref: "class",
        },
        section: {
            type: ObjectId,
            ref: "section",
        },
        department: {
            type: ObjectId,
            ref: "Department",
        },
        type_from: {
            type: String,
            required: true,
            enum: ["half", "full"],
        },
        type_to: {
            type: String,
            required: true,
            enum: ["half", "full"],
        },
        school: {
            type: ObjectId,
            // required: true,
            ref: "schooldetail",
        },
        session: {
            type: ObjectId,
            ref: "session",
        },
        updated_by: {
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
module.exports = mongoose.model("leave", leaveSchema);