//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var LibrariesectionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Allocated", "Return"],
      default: "Allocated",
    },
    book: {
      type: ObjectId,
      ref: "book",
      required: true,
    },
    bookID: {
      type: String,
      required: true,
      trim: true,
    },
    student: {
      type: ObjectId,
      ref: "student",
    },
    staff: {
      type: ObjectId,
      ref: "staff",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    returned: {
      type: Boolean,
      default: false,
    },
    allocatedBy: {
      type: ObjectId,
      ref: "staff",
    },
    collectedBy:{
      type: ObjectId,
      ref: "staff",
    },  
    allocationDate: {
      type: Date,
      default: Date.now(),

    },
    collectionDate:{
      type: Date,
      default: Date.now(),
    },
    duration: {
      type: Number,
      default: 1,
     
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
    allocationType:{
      type:String,
      enum:["Read Here","Rent"],
      default:"Read Here",
    },
    rent:{
      type:"Number",
      default:0,
    } 
  },
  { timestamps: true }
);

module.exports = mongoose.model("librariehistory", LibrariesectionSchema);
