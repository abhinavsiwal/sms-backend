//import all require dependencies
var mongoose = require("mongoose");

const {ObjectId} = mongoose.Schema

//schema for superAdmin
var schoolDetailSchema = new mongoose.Schema(
  {
    schoolname: {
      type: String,
      required: true,
      trim: true,
    },
    affiliate_board: {
      type: String,
      required: true,
      trim: true,
    },
    abbreviation: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: Number,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    phone: {
      type: Number,
      trim: true,
      required: true,
    },
    telephone: {
      type: Number,
      trim: true,
      required: true,
    },
    admin: {
      type: ObjectId,
      ref: "schoolAdmin",
    },
    photo: {
      type: String,
      // required: true,
      trim: true,
    },
    website: {
      type: String,
    },
    startDate:{
      type: String,
      required: true,
      trim: true,
    },
    endDate:{
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      name:{
        type:String,
      },
      price:{
        type:Number
      },
      duration:{
        type:String
      }
    },
    module: {
      type: Array,
      required: true,
      trim: true,
    },
    status:{
      type:String,
      enum:['Active','Block'],
      default:'Active'
    }
  },
  { timestamps: true }
);

schoolDetailSchema.indexes({abbreviation:"text"})

module.exports = mongoose.model("schooldetail", schoolDetailSchema);
