//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const LibraryAllocationSchema = new mongoose.Schema({
    student:{
        type: ObjectId,
        ref: "student",
    },
    book:{
        type: ObjectId,
        ref: "book",
        required: true,
    },
    bookID:{
        type: String,
        required: true,
        trim: true,
    },
    school: {
        type: ObjectId,
        ref: "schooldetail",
        required: true,
      },


});

module.exports = mongoose.model("libraryAllocatioin", LibraryAllocationSchema);