//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var hostelFloor = new mongoose.Schema(
  {
    building: {
      type: ObjectId,
      ref: "hostelBuilding",
      required: true,
    },
    no_of_floors: {
      type: Number,
      required: true,
      trim: true,
    },
    rooms_per_floor: {
      type: Number,
      required: true,
      trim: true,
    },
    sharing_type: {
      type: String,
      required: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("hostelBuildingFloor", hostelFloor);
