//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var fees_transactions = new mongoose.Schema(
    {
        fees_collection_id: [{
            type: ObjectId,
            ref: "student_fees_collection",
            required: true,
        }],
        type: {
            type: String,
            required: true,
            trim: true,
        },
        cheque_number: {
            type: String,
        },
        transaction_id: {
            type: String,
        },
        bank_name: {
            type: String,
        },
        account_number: {
            type: String,
        },
        pay_to: {
            type: String,
        },
        pay_by: {
            type: String,
        },
        transaction_date: {
            type: Date,
        },
        collected_by: {
            type: String,
        },
        total_amount: {
            type: Number,
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
        coupon_id: {
            type: ObjectId,
            ref: "coupon_master",
        },
        discount_amount: {
            type: Number,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("fees_transactions", fees_transactions);
