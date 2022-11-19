//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var subSiblings = new mongoose.Schema({
    class: {
        type: ObjectId,
        ref: "class",
        required: true,
    },
    section: {
        type: ObjectId,
        ref: "section",
    },
    sibling: {
      type: ObjectId,
      ref: "sibling_master",
      required: true,
    },
    student: {
        type: ObjectId,
        ref: "student",
        required: true,
    },
    rate: {
        type: Number
    },
    type: {
        type: String,
        enum: ["P", "F"]
    },
    updated_by: {
        type: ObjectId,
        ref: "staff",
        required: true,
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

module.exports = mongoose.model("sub_sibling", subSiblings);
