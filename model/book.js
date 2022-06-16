//import all require dependencies
var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//schema for superAdmin
var bookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    bookID: [
      {
        type: String,
        trim: true,
      },
    ],
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
      required: true,
    },
    section: {
      type: ObjectId,
      ref: "librariesection",
      required: true,
    },
    shelf: {
      type: ObjectId,
      ref: "librarieshelf",
      required: true,
    },
  },
  { timestamps: true }
);

bookSchema.indexes({ name: "text" });

module.exports = mongoose.model("book", bookSchema);
