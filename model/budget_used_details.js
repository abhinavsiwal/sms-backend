//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var BudgetUsedSchema = new mongoose.Schema(
    {
        event_name: {
            type: String,
            required: true,
            trim: true,
        },
        department: {
            type: ObjectId,
            ref: "Department"
        },
        staff: {
            type: ObjectId,
            ref: "staff",
        },
        description: {
            type: String,
            trim: true,
        },
        used_by: {
            type: ObjectId,
            ref: "staff",
        },
        confirm_by: {
            type: ObjectId,
            ref: "staff",
        },
        session: {
            type: ObjectId,
            ref: "session",
            required: true
        },
        advance: {
            type: Number,
            required: true,
        },
        used_amount: {
            type: Number,
            required: true,
        },
        amount_paid: {
            type: Number,
            required: true,
        },
        amount_collected: {
            type: Number,
            required: true,
        },
        bill_type: {
            type: String,
            enum : ['yes','no'],
            trim: true,
        },
        document_name: {
            type: String,
            trim: true,
        },
        reimburse: {
            type: String,
            enum : ['yes','no'],
            trim: true,
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("budget_used_details", BudgetUsedSchema);
