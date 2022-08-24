//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var examSubjectMaster = new mongoose.Schema(
    {
        exam_master_id: {
            type: ObjectId,
            ref: "examMaster",
        },
        full_marks: {
            type: Number,
            required: true,
            trim: true,
        },
        passing_marks: {
            type: Number,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        sub_subject: [{
            name: String,
            full_marks: Number,
            passing_marks: Number,
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("examSubjectMaster", examSubjectMaster);
