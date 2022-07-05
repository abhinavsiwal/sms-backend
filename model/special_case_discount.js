//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var specialCaseDiscountSchema = new mongoose.Schema(
    {
        class: {
            type: ObjectId,
            ref: "class",
            required: true,
        },
        school: {
            type: ObjectId,
            ref: "schooldetail",
            required: true,
        },
        student: {
            type: ObjectId,
            ref: "student",
        },
        section:{
            type: ObjectId,
            ref: "section",
        },
        description: {
            type: String,
            trim: true,
            required: true,
        },
        managed_by: {
            type: String,
            trim: true,
            required: true,
        },
        session: {
            type: ObjectId,
            ref: "session",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("special_case_discount", specialCaseDiscountSchema);
