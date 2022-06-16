//uuid v4 for create salt unique key
const { v4: uuidv4 } = require("uuid");

//import all require dependencies
var mongoose = require("mongoose");
const crypto = require("crypto");

//schema for superAdmin 
var superAdminSchema = new mongoose.Schema(
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
    email: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    current_address: {
      type: String,
      required: true,
      trim: true,
    },
    permanent_address: {
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
    date_of_birth: {
      type: Date,
      required: true,
      trim: true,
    },
    permissions: {
      type: Object,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      trim: true,
      required: true,
    },
    encry_password: {
      type: String,
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
superAdminSchema
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
superAdminSchema.methods = {
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


module.exports = mongoose.model("superAdmin", superAdminSchema);
