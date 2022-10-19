//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var IdCardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
            trim: true,
        },
        contact_no: {
            type: String,
            required: true,
            trim: true,
        },
        color_1: {
            type: String,
            trim: true,
        },
        color_2: {
            type: String,
            trim: true,
        },
        watermark:{
            type: String,
            required: true,
            default: "N",
            enum: ["Y", "N"]
        },
        school: {
            type: ObjectId,
            ref: "schooldetail",
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("school_id_card", IdCardSchema);
