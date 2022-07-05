//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var penaltySchema = new mongoose.Schema(
    {
        sub_fees_management_id: [{
            type: ObjectId,
            ref: "fees_sub_management",
            required: true,
        }],
        penalty_charges: {
            type: String,
            trim: true,
            required: true,
        },
        applicable_date: {
            type: Date,
            required: true,
        },
        penalty_rate: {
            type: String,
            required: true,
        },
        school: {
            type: ObjectId,
            ref: "schooldetail",
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("penalty_management", penaltySchema);
