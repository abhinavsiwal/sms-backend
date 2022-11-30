//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var classTimeTableSchema = new mongoose.Schema(
{
    period_id: {
        type: ObjectId,
        ref: "period_master",
        required: true,
    },
    staff: {
        type: ObjectId,
        ref: "staff",
        // required: true,
    },
    subject: {
        type: String,
        trim: true,
    },
    day: {
        type: String,
        trim: true,
    },
    subject_id: {
        type: ObjectId,
        ref: "subject",
    },
    school: {
        type: ObjectId,
        ref: "schooldetail",
        required: true,
    },
    updated_by: {
        type: ObjectId,
        ref: "staff",
    },
    meet_link: {
        type: String,
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

module.exports = mongoose.model("class_time_table", classTimeTableSchema);
