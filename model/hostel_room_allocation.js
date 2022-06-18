//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var hostelRoomAllocation = new mongoose.Schema(
{
    building: {
        type: ObjectId,
        ref: "hostelBuilding",
        required: true,
    },
    class:{
        type: ObjectId,
        ref: "class",
    },
    section:{
        type: ObjectId,
        ref: "section",
    },
    department:{
        type: ObjectId,
        ref: "Department",
    },
    student: {
        type: ObjectId,
        ref: "student",
    },
    staff: {
        type: ObjectId,
        ref: "staff",
    },
    room_number: {
      type: Number,
      required: true,
      trim: true,
    },
    allocatedBy: {
        type: ObjectId,
        ref: "staff",
    },
    allocationDate: {
        type: Date,
        default: Date.now(),
    },
    vacantBy: {
        type: ObjectId,
        ref: "staff",
    },
    vacantDate: {
        type: Date
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("hostelRoomAllocation", hostelRoomAllocation);
