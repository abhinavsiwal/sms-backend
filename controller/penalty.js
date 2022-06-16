//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const crypto = require("crypto");
var aws = require("aws-sdk");
const fs = require("fs");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
//import require models
const Penalty = require("../model/penalty");
const School = require("../model/schooldetail");

//s3 aws
aws.config.update({
  accessKeyId: process.env.accessKeyID,
  secretAccessKey: process.env.secretAccessID,
  region: process.env.region,
});
const s3 = new aws.S3();

//s3 upload file function
function uploadFile(file, name, type) {
  const params = {
    Bucket: process.env.BucketPenalty,
    Body: file,
    Key: `${name}`,
    ContentEncoding: "base64",
    ContentType: type,
  };
  return s3.upload(params).promise();
}

//exports routes controller
exports.getPenaltyByID = (req, res, next, id) => {
  try {
    Penalty.findById(id).exec((err, penalty) => {
      if (err || !penalty) {
        return res.status(400).json({
          err: "No Penalty was found in Database",
        });
      }
      req.penalty = penalty;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createPenalty = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    } else {
      let penalty = new Penalty(fields);
      try {
        Penalty.findOne(
          {
            school: fields.school,
            class: fields.class,
            session: fields.session,
          },
          (err, data) => {
            if (err) {
              return res.status(400).json({
                err: "Please Check Data!",
              });
            }
            if (data) {
              return res.status(400).json({
                err: "Penalty is Already Created",
              });
            }
            if (!data) {
              penalty.penalty = JSON.parse(fields.penalty);
              penalty.save((err, penalty) => {
                if (err) {
                  return res.status(400).json({
                    err: "Please Check Data!",
                  });
                }
                res.json(penalty);
              });
            }
          }
        );
      } catch (error) {
        console.log("Create Penalty Error", error);
      }
    }
  });
};

exports.getPenalty = (req, res) => {
  Penalty.findOne({ _id: req.penalty._id })
    .populate("school")
    .populate("session")
    .populate("class")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Penalty",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.updatePenalty = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    try {
      let penalty = req.penalty;
      
      penalty = _.extend(penalty, fields);
      if (fields.penalty) {
        penalty.penalty = JSON.parse(fields.penalty);
      }
      penalty.save((err, penalty) => {
        if (err) {
          return res.status(400).json({
            err: "Update penalty in Database is Failed",
          });
        }
        res.json(penalty);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllPenalty = (req, res) => {
  try {
    Penalty.find({ school: req.schooldoc._id })
      .populate("school")
      .populate("session")
      .populate("class")
      .sort({ createdAt: -1 })
      .then((penalty, err) => {
        if (err || !penalty) {
          return res.status(400).json({
            err: "Database Dont Have Penalty",
          });
        }
        return res.json(penalty);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllPenaltyCustome = (req, res) => {
  var classs = req.body.class;
  var session = req.body.session;
  try {
    Penalty.findOne({
      school: req.schooldoc._id,
      class: classs,
      session: session,
    })
      .populate("school")
      .populate("session")
      .populate("class")
      .sort({ createdAt: -1 })
      .then((penalty, err) => {
        if (err || !penalty) {
          return res.status(400).json({
            err: "Database Dont Have Penalty",
          });
        }
        return res.json(penalty);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deletePenalty = (req, res) => {
  let penalty = req.penalty;
  try {
    penalty.remove((err, penalty) => {
      if (err || !penalty) {
        return res.status(400).json({
          err: "Can't Able To Delete penalty",
        });
      }
      return res.json({
        Massage: `Penalty is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
