//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var examMaster = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true,
    },
    class:{
        type: ObjectId,
        ref: "class",
    },
    section:{
        type: ObjectId,
        ref: "section",
    },
    session: {
        type: ObjectId,
        ref: "session",
        required: true,
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

module.exports = mongoose.model("examMaster", examMaster);
