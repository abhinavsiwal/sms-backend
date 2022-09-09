//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const crypto = require("crypto");
//import require models
const Support = require("../model/support");
const School = require("../model/schooldetail");

//exports routes controller
exports.getSupportByID = (req, res, next, id) => {
  try {
    Support.findById(id).exec((err, Support) => {  
      if (err || !Support) {  
        return res.status(400).json({  
          err: "No Support was found in Database",
        });
      }
      req.support = Support;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createSupport = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    School.findOne({ _id: fields.school }, async (err, data) => {
      if (err) {
        return res.status(400).json({
          err: "Fetching abbreviation of school is failed!",
        });
      } else {
        try {
          var sqlnumber = crypto.randomBytes(3).toString("hex");
          var SID = data.abbreviation + "SPT" + sqlnumber;
          fields.SID = SID;
        } catch (error) {
          console.log(error);
        }
        let support = new Support(fields);
        try {
          support.save((err, support) => {
            if (err) {
              return res.status(400).json({
                err: "Error Please Check Your Data!",
              });
            }
            res.json(support);
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  });
};

exports.getSupport = (req, res) => {
  return res.json(req.support);
};

exports.updateSupport = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let support = req.support;
    support = _.extend(support, fields);
    try {
      support.save((err, support) => {
        if (err) {
          return res.status(400).json({
            err: "Update Support in Database is Failed",
          });
        }
        res.json(support);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllSupports = (req, res) => {
  try {
    Support.find()
      .sort({ createdAt: -1 })
      .populate("school")
      .then((support, err) => {
        if (err || !support) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(support);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllSupportForSchool = (req, res) => {
  try {
    Support.find({ school: req.schooldoc._id })
      .sort({ createdAt: -1 })
      .then((support, err) => {
        if (err || !support) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(support);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteSupport = (req, res) => {
  let support = req.support;
  try {
    support.remove((err, support) => {
      if (err || !support) {
        return res.status(400).json({
          err: "Can't Able To Delete support",
        });
      }
      return res.json({
        Massage: `Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
