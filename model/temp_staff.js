//uuid v4 for create salt unique key
const { v4: uuidv4 } = require("uuid");

//import all require dependencies
var mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

//schema for superAdmin
var tempStaffSchema = new mongoose.Schema(
  {
    photo: {
      type: String,
      trim: true,
    },
    tempPhoto: {
      type: String,
    },
    SID: {
      type: String,
      trim: true,
    },
    documents: [
      {
        type: Array,
      },
    ],
    firstname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    email: {
      type: String,
      maxlength: 32,
      trim: true,
    },
    phone: {
      type: Number,
      trim: true,
    },
    alternate_phone: {
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
    joining_date: {
      type: Date,
      trim: true,
    },
    present_address: {
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
    permanent_address: {
      type: String,
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
    contact_person_name: {
      type: String,
      trim: true,
    },
    contact_person_relation: {
      type: String,
      trim: true,
    },
    contact_person_phone: {
      type: String,
      trim: true,
    },
    contact_person_address: {
      type: String,
      trim: true,
    },
    contact_person_state: {
      type: String,
      trim: true,
    },
    contact_person_city: {
      type: String,
      trim: true,
    },
    contact_person_country: {
      type: String,
      trim: true,
    },
    contact_person_pincode: {
      type: Number,
      trim: true,
    },
    job: {
      type: String,
      trim: true,
    },
    job_description: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    subject: [
      {
        type: ObjectId,
        ref: "subject",
      },
    ],
    session: {
      type: ObjectId,
      ref: "session",
    },
    department: {
      type: ObjectId,
      ref: "Department",
    },
    head: {
      type: ObjectId,
      ref: "Department",
    },
    schoolClassTeacher: {
      type: ObjectId,
      ref: "section",
    },
    school: {
      type: ObjectId,
      ref: "schooldetail",
    },
    section: {
      type: ObjectId,
      ref: "section",
    },
    temp: {
      type: String,
    },
    encry_password: {
      type: String,
    },
    salt: String,
    assign_role: {
      type: ObjectId,
      ref: "role",
    },
    isHead: {
      type: Boolean,
      default: false,
    },
    isClassTeacher: {
      type: Boolean,
      default: false,
    },
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
tempStaffSchema
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
tempStaffSchema.methods = {
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

module.exports = mongoose.model("tempStaff", tempStaffSchema);
