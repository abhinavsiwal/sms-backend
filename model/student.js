//uuid v4 for create salt unique key
const { v4: uuidv4 } = require("uuid");

//import all require dependencies
var mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

//schema for superAdmin
var studentSchema = new mongoose.Schema(
  {
    photo: {
      type: String,
      trim: true,
    },
    tempPhoto: {
      type: String,
      // required: true,
    },
    SID: {
      type: String,
      required: true,
      trim: true,
    },
    parent_SID: {
      type: String,
      required: true,
      trim: true,
    },
    documents: [
      {
        type: Array,
      },
    ],
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
      maxlength: 32,
      trim: true,
      unique: true,
    },
    phone: {
      type: Number,
      trim: true,
    },
    alternate_phone: {
      type: Number,
      trim: true,
    },
    aadhar_number: {
      type: Number,
      trim: true,
    },
    date_of_birth: {
      type: Date,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    birth_place: {
      type: String,
      trim: true,
    },
    caste: {
      type: String,
      trim: true,
    },
    religion: {
      type: String,
      trim: true,
    },
    mother_tongue: {
      type: String,
      trim: true,
    },
    bloodgroup: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    joining_date: {
      type: Date,
      trim: true,
    },
    previous_school: {
      type: String,
      trim: true,
    },
    present_address: {
      type: String,
      trim: true,
    },
    permanent_address: {
      type: String,
      trim: true,
    },
    permanent_state: {
      type: String,
      trim: true,
    },
    permanent_country: {
      type: String,
      trim: true,
    },
    permanent_city: {
      type: String,
      trim: true,
    },
    permanent_pincode: {
      type: Number,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    pincode: {
      type: Number,
      trim: true,
    },
    guardian_name: {
      type: String,
      trim: true,
    },
    guardian_mother_tongue: {
      type: String,
      trim: true,
    },
    guardian_last_name: {
      type: String,
      trim: true,
    },
    guardian_phone: {
      type: Number,
      trim: true,
    },
    guardian_email: {
      type: String,
      trim: true,
    },
    guardian_address: {
      type: String,
      trim: true,
    },
    guardian_blood_group: {
      type: String,
      trim: true,
    },
    guardian_dob: {
      type: Date,
      trim: true,
    },
    guardian_nationality: {
      type: String,
      trim: true,
    },
    guardian_pincode: {
      type: String,
      trim: true,
    },

    father_name: {
      type: String,
      trim: true,
    },
    father_last_name: {
      type: String,
      trim: true,
    },
    father_phone: {
      type: Number,
      trim: true,
    },
    father_blood_group: {
      type: String,
      trim: true,
    },
    father_dob: {
      type: Date,
      trim: true,
    },
    father_mother_tongue: {
      type: String,
      trim: true,
    },
    father_nationality: {
      type: String,
      trim: true,
    },
    father_pincode: {
      type: Number,
      trim: true,
    },
    father_pincode: {
      type: String,
      trim: Number,
    },
    mother_pincode: {
      type: String,
      trim: Number,
    },

    mother_name: {
      type: String,
      trim: true,
    },
    mother_last_name: {
      type: String,
      trim: true,
    },
    mother_phone: {
      type: Number,
      trim: true,
    },
    mother_blood_group: {
      type: String,
      trim: true,
    },
    mother_dob: {
      type: Date,
      trim: true,
    },
    mother_mother_tongue: {
      type: String,
      trim: true,
    },
    mother_nationality: {
      type: String,
      trim: true,
    },

    parent_address: {
      type: String,
      trim: true,
    },
    parent_email: {
      type: String,
      trim: true,
    },
    class: {
      type: ObjectId,
      ref: "class",
    },
    roll_number: {
      type: Number,
      trim: true,
    },
    section: {
      type: ObjectId,
      ref: "section",
    },
    school: {
      type: ObjectId,
      required: true,
      ref: "schooldetail",
    },
    session: {
      type: ObjectId,
      required: true,
      ref: "session",
    },
    encry_password: {
      type: String,
    },
    parent_encry_password: {
      type: String,
    },
    temp: {
      type: String,
    },
    parent_temp: {
      type: String,
    },
    salt: String,
    parent_salt: String,
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    token: String,
    tokenexpire: Date,
    baseFields: {
      type: Object,
      trim: true,
    },
    ParentbaseFields: {
      type: Object,
      trim: true,
    },
    issuedBooks: [
      {
        type: ObjectId,
        ref: "librariehistory",
      },
    ],
  },
  { timestamps: true }
);

//password field handler which handle the password eny process
studentSchema
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
studentSchema.methods = {
  autheticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  parent_autheticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.parent_encry_password;
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

//password field handler which handle the password eny process
studentSchema
  .virtual("parent_password")
  .set(function (password) {
    this._password = password;
    this.parent_salt = uuidv4();
    this.parent_encry_password = this.securePassword(password);
  })
  .get(function () {
    return this._password;
  });

module.exports = mongoose.model("student", studentSchema);
