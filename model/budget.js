//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var BudgetSchema = new mongoose.Schema(
{
    staff: {
        type: ObjectId,
        ref: "staff",
    },
    session: {
        type: ObjectId,
        ref: "session",
        required: true,
    },
    allocated: {
        type: Number,
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

module.exports = mongoose.model("budget", BudgetSchema);
