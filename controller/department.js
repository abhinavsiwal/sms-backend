//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Department = require("../model/department");
const schoolAdmin = require("../model/schoolAdmin");

//exports routes controller
exports.getDepartmentByID = (req, res, next, id) => {
  try {
    Department.findById(id).exec((err, doc) => {
      if (err || !doc) {
        return res.status(400).json({
          err: "No Department Detail was found in Database",
        });
      }
      req.department = doc;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createDepartment = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    try {
      let department = new Department(fields);
      if (fields.role) {
        department.role = JSON.parse(fields.role);
      }
      department.save((err, department) => {
        if (err) {
          return res.status(400).json({
            err: "Error Please Check Your Data!",
          });
        }
        res.json(department);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getDepartment = (req, res) => {
  Department.findOne({ _id: req.department._id })
    .populate("school")
    .populate("role")
    .populate("primary_head")
    .populate("secondary_head")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the department detail",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.updateDepartment = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    if (fields.removePrimaryHead === true || fields.removePrimaryHead !== undefined) {
      Department.updateOne(
        { _id: fields.id },
        { $unset: { primary_head: 1 } }
      ).then((doc, err) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "Database Dont Have department",
          });
        }
        var status = { status: true };
        return res.json(status);
      });
    } else if (
      fields.removeSecondaryHead === true ||
      fields.removeSecondaryHead !== undefined
    ) {
      Department.updateOne(
        { _id: fields.id },
        { $unset: { secondary_head: 1 } }
      ).then((doc, err) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "Database Dont Have department",
          });
        }
        var status = { status: true };
        return res.json(status);
      });
    } else {
      try {
        let department = req.department;
        department = _.extend(department, fields);
        if (fields.role) {
          department.role = JSON.parse(fields.role);
        }
        department.save((err, department) => {
          if (err) {
            return res.status(400).json({
              err: "Update department in Database is Failed",
            });
          }
          res.json(department);
        });
      } catch (error) {
        console.log(error);
      }
    }
  });
};

exports.getAllDepartment = (req, res) => {
  try {
    Department.find({ school: req.schooldoc._id })
      .populate("school")
      .populate("role")
      .populate("primary_head")
      .populate("secondary_head")
      .sort({ createdAt: -1 })
      .then((doc, err) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "Database Dont Have department",
          });
        }
        return res.json(doc);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteDepartment = (req, res) => {
  let department = req.department;
  try {
    department.remove((err, department) => {
      if (err || !department) {
        return res.status(400).json({
          err: "Can't Able To Delete department",
        });
      }
      return res.json({
        Massage: `${department.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
