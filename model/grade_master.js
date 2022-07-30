//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var gradeMaster = new mongoose.Schema(
{
    min: {
        type: Number,
        required: true,
        trim: true,
    },
    max: {
        type: Number,
        required: true,
        trim: true,
    },
    grade: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
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

module.exports = mongoose.model("gradeMaster", gradeMaster);
