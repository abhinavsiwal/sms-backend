//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var shelfSchema = new mongoose.Schema(
  {
    staff: {
        type: ObjectId,
        ref: "staff",
    },
    amount: {
        type: Number,
        required: true,
        trim: true,
    },
    total_salary: {
        type: Number,
        required: true,
        trim: true,
    },
    percentage: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum : ['awaiting','approved','declined'],
        trim: true,
    },
    approved_by: {
        type: ObjectId,
        ref: "staff",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("advance_salary_request", shelfSchema);
