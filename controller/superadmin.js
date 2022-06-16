//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const superAdmin = require("../model/superAdmin");

//exports routes controller
exports.getSuperAdminByID = (req, res, next, id) => {
  try {
    superAdmin.findById(id).exec((err, admin) => {
      if (err || !admin) {
        return res.status(400).json({
          err: "No Super Admin was found in Database",
        });
      }
      req.profile = admin;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createSuperAdmin = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    console.log(fields);
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let admins = new superAdmin(fields);
    try {
      admins.permissions = JSON.parse(fields.permissions);
      superAdmin.find({ email: admins.email }, (err, admin) => {
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
              return res.status(400).json({
                err: "Email ID is Already Exits!",
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

exports.getSuperAdmin = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    } else {
      superAdmin.findById(fields.id).exec((err, admin) => {
        if (err || !admin) {
          return res.status(400).json({
            err: "No Super Admin was found in Database",
          });
        }
        return res.json(admin);
      });
    }
  });
};

exports.getSuperAdminPermission = (req, res) => {
  if (req.profile) {
    res.json(req.profile.permissions);
  } else {
    return res.status(400).json({
      err: "Problem With Data For SuperAdmin!",
    });
  }
};

exports.updateSuperAdmin = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    console.log(fields);
    superAdmin.findOne({ _id: fields.id }, (err, adminData) => {
      if (err) {
        return res.status(400).json({
          err: "User is not Found Please Check Again",
        });
      } else {
        let admin = adminData;
        if (fields.permission) {
          admin.permissions = JSON.parse(fields.permission);
        }
        admin = _.extend(admin, fields);
        try {
          admin.save((err, admin) => {
            if (err) {
              return res.status(400).json({
                err: "Update Super Admin in Database is Failed",
              });
            }
            res.json(admin);
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  });
};

exports.getAllSuperAdmin = (req, res) => {
  try {
    superAdmin
      .find({ role: 0 })
      .sort({ createdAt: -1 })
      .then((alladmin, err) => {
        if (err || !alladmin) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        alladmin.encry_password = undefined;
        alladmin.salt = undefined;
        return res.json(alladmin);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteSuperAdmin = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    superAdmin.deleteOne({ _id: fields.id }, (err, adm) => {
      if (err || !adm) {
        return res.status(400).json({
          err: "Can't Able To Delete Admin",
        });
      }
      return res.json({
        message: `${adm.email} is Deleted SuccessFully`,
      });
    });
  });
};
