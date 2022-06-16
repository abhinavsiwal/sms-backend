//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Role = require("../model/role");

//exports routes controller
exports.getRoleByID = (req, res, next, id) => {
  try {
    Role.findById(id).exec((err, role) => {
      if (err || !role) {
        return res.status(400).json({
          err: "No Role was found in Database",
        });
      }
      req.role = role;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createRole = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let role = new Role(fields);

    try {
      role.save((err, role) => {
        if (err) {
          return res.status(400).json({
            err: "Please Check Your Data!",
          });
        }
        res.json(role);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getRole = (req, res) => {
  req.json(req.role);
};

exports.updateRole = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let role = req.role;
    role = _.extend(role, fields);
    try {
      if (fields.permissions) {
        role.permissions = JSON.parse(fields.permissions);
      }
      role.save((err, role) => {
        if (err) {
          return res.status(400).json({
            err: "Update role in Database is Failed",
          });
        }
        res.json(role);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllRole = (req, res) => {
  try {
    Role.find({ school: req.schooldoc._id })
      .sort({ createdAt: -1 })
      .then((role, err) => {
        if (err || !role) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(role);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteRole = (req, res) => {
  let role = req.role;
  if (role.delete === 1) {
    try {
      role.remove((err, role) => {
        if (err || !role) {
          return res.status(400).json({
            err: "Can't Able To Delete role",
          });
        }
        return res.json({
          err: `${role.name} is Deleted SuccessFully`,
        });
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    return res.json({
      err: `can not be deleted`,
    });
  }
};
