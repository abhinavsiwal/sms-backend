//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var sessionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        start_date: {
            type: Date,
            required: true,
            trim: true,
        },
        end_date: {
            type: Date,
            required: true,
            trim: true,
        },
        year: {
            type: String,
            required: true,
            trim: true,
        },
        working_days: {
            type: Number,
            required: true,
            trim: true,
        },
        fees_method: {
            type: String,
            required: true,
        },
        working_time: {
            type: String,
            required: true,
            trim: true,
        },
        earned_leaves: {
            type: Number,
            required: true,
            trim: true,
        },
        school: {
            type: ObjectId,
            ref: "schooldetail",
            required: true,
        },
        status: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("session", sessionSchema);
