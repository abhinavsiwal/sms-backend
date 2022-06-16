//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema
var paymentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["Cash", "Cheque", "NEFT", "Net Banking", "Payment Gateway"],
    },
    total_amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
    },
    collected_by: {
      type: String,
      trim: true,
    },
    cheque_number: {
      type: String,
      trim: true,
    },
    bank_name: {
      type: String,
      trim: true,
    },
    transaction_date: {
      type: Date,
      trim: true,
    },
    transaction_id: {
      type: String,
      trim: true,
    },
    account_number: {
      type: Number,
      trim: true,
    },
    pay_to: {
      type: String,
      trim: true,
    },
    pay_by: {
      type: String,
      trim: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("payment", paymentSchema);
