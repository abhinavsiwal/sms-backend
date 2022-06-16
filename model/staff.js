//uuid v4 for create salt unique key
const { v4: uuidv4 } = require("uuid");

//import all require dependencies
var mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

//schema for superAdmin
var staffSchema = new mongoose.Schema(
  {
    photo: {
      type: String,
      // required: true,
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
      required: true,
    },
    phone: {
      type: Number,
      trim: true,
      required: true,
    },
    alternate_phone: {
      type: Number,
      trim: true,
      required: true,
    },
    date_of_birth: {
      type: Date,
      trim: true,
      required: true,
    },
    gender: {
      type: String,
      trim: true,
      required: true,
    },
    birth_place: {
      type: String,
      trim: true,
      required: true,
    },
    caste: {
      type: String,
      trim: true,
      required: true,
    },
    religion: {
      type: String,
      trim: true,
      required: true,
    },
    mother_tongue: {
      type: String,
      trim: true,
      required: true,
    },
    bloodgroup: {
      type: String,
      trim: true,
      required: true,
    },
    joining_date: {
      type: Date,
      trim: true,
      required: true,
    },
    present_address: {
      type: String,
      trim: true,
      required: true,
    },
    permanent_address: {
      type: String,
      trim: true,
      required: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
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
    contact_person_name: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_relation: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_phone: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_address: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_state: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_city: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_country: {
      type: String,
      required: true,
      trim: true,
    },
    contact_person_pincode: {
      type: Number,
      required: true,
      trim: true,
    },
    job: {
      type: String,
      // required: true,
      trim: true,
    },
    job_description: {
      type: String,
      // required: true,
      trim: true,
    },
    salary: {
      type: Number,
      // required: true,
      trim: true,
    },
    qualification: {
      type: String,
      // required: true,
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
      required: true,
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
      required: true,
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
staffSchema
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
staffSchema.methods = {
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

module.exports = mongoose.model("staff", staffSchema);
