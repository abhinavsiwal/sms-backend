//uuid v4 for create salt unique key
const { v4: uuidv4 } = require("uuid");

//import all require dependencies
var mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

//schema for superAdmin
var schoolAdminSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },
    SID: {
      type: String,
      trim: true,
    },
    temp: {
      type: String,
    },
    email: {
      type: String,
      maxlength: 32,
      trim: true,
      unique: true,
      required: true,
    },
    phone: {
      type: Number,
      trim: true,
      required: true,
    },
    designation: {
      type: String,
      trim: true,
      required: true,
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
    encry_password: {
      type: String,
    },
    image: {
      type: String,
    },
    permissions: {
      type: Object,
      trim: true,
    },
    salt: String,
    role: {
      type: Number,
      default: 0,
    },
    token: String,
    tokenexpire: Date,
  },
  { timestamps: true }
);

//password field handler which handle the password eny process
schoolAdminSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv4();
    this.encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

//superAdminSchema schema all methods
schoolAdminSchema.methods = {
  autheticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("schoolAdmin", schoolAdminSchema);
