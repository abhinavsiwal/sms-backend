//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var transportationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bus_number: {
      type: String,
      required: true,
      trim: true,
    },
    start: {
      type: String,
      required: true,
      trim: true,
    },
    end: {
      type: String,
      required: true,
      trim: true,
    },
    stops: [
      {
        type: Object,
        trim: true,
      },
    ],
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    session: {
      type: ObjectId,
      ref: "session",
      required: true,
    },
    staff: [
      {
        type: ObjectId,
        ref: "staff",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("transportation", transportationSchema);
