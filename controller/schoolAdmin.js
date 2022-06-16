//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);

//import require models
const schoolAdmin = require("../model/schoolAdmin");

//exports routes controller
exports.getSchoolAdminByID = (req, res, next, id) => {
  try {
    schoolAdmin.findById(id).exec((err, admin) => {
      if (err || !admin) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.schooladmin = admin;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createSchoolAdmin = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let admins = new schoolAdmin(fields);
    try {
      schoolAdmin.find({ email: admins.email }, (err, admin) => {
        if (err) {
          return res.status(400).json({
            err: "Email ID is Already Exits!",
          });
        } else if (admin === []) {
          return res.status(400).json({
            err: "Email ID is Already Exits!",
          });
        } else {
          admins.save((err, admin) => {
            if (err) {
              console.log(err)
              return res.status(400).json({
                err: "Please Check Admin Data! Not in Correct Format",
              });
            }
            res.json(admin);
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getSchoolAdmin = (req, res) => {
  res.json(req.schooladmin);
};

exports.updateSchoolAdmin = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let schooladmin = req.schooladmin;
    schooladmin = _.extend(schooladmin, fields);

    try {
      if (fields.module) {
        schooladmin.module = JSON.parse(fields.module);
      }
      schooladmin.save((err, schooladmin) => {
        if (err) {
          return res.status(400).json({
            err: "Update schooladmin in Database is Failed",
          });
        }
        res.json(schooladmin);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllSchoolAdmin = (req, res) => {
  try {
    schoolAdmin
      .find({ role: 0 })
      .sort({ createdAt: -1 })
      .populate('school')
      .then((alladmin, err) => {
        if (err || !alladmin) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        alladmin.encry_password = undefined;
        alladmin.salt = undefined;
        alladmin.map(async (data) => {
          data.salt = undefined;
          data.encry_password = undefined;
          data.temp = encryptor.decrypt(data.temp);
        });
        return res.json(alladmin);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteSchoolAdmin = (req, res) => {
  let schooladmin = req.schooladmin;
  try {
    schooladmin.remove((err, schooladmin) => {
      if (err || !schooladmin) {
        return res.status(400).json({
          err: "Can't Able To Delete schooladmin",
        });
      }
      return res.json({
        Massage: `${schooladmin.firstname} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
