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
    department: {
        type: ObjectId,
        ref: "Department"
    },
    basic_salary: {
        type: Number,
        required: true,
        trim: true,
    },
    lta: {
        type: Number,
        trim: true,
    },
    hra: {
        type: Number,
        trim: true,
    },
    professional_tax: {
        type: Number,
        trim: true,
    },
    other: {
        type: Number,
        trim: true,
    },
    total_amount: {
        type: Number,
        trim: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("salary_breakup", shelfSchema);
