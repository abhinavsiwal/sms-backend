var mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        image: {
          type: String,
          // required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        product: {
          type: ObjectId,
          required: true,
          ref: "product",
        },
      },
    ],
    staff: {
      type: ObjectId,
      ref: "staff",
    },
    student: {
      type: ObjectId,
      ref: "student",
    },
    orderStatus: {
      type: String,
      required: true,
      default: "processing",
    },
    totalAmount:{
      type:Number,
      required:true,
    },
    deliveredAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    school: {
      type: ObjectId,
      required: true,
      ref: "schooldetail",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);