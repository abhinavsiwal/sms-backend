//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var feesSchema = new mongoose.Schema(
    {
        fees_management_id: {
            type: ObjectId,
            ref: "fees_management",
            required: true,
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
        total_amount: {
            type: String,
            required: true,
        },
        fees_type: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("fees_sub_management", feesSchema);
