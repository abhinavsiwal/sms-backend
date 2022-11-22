//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var siblingMaster = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    no_of_students: {
        type: Number,
        required: true,
    },
    session: {
        type: ObjectId,
        ref: "session",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
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

module.exports = mongoose.model("sibling_master", siblingMaster);
