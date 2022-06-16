//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema
var departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    primary_head: {
      type: ObjectId,
      ref: "staff",
    },
    secondary_head: {
      type: ObjectId,
      ref: "staff",
    },
    session: {
      type: ObjectId,
      ref: "session",
      required: true,
    },
    school: {
      type: ObjectId,
      required: true,
      ref: "schooldetail",
    },
    role: [
      {
        type: ObjectId,
        ref: "role",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
