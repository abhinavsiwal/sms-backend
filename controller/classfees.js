//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const crypto = require("crypto");
var aws = require("aws-sdk");
const fs = require("fs");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
//import require models
const Classfees = require("../model/classfees");
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
    Bucket: process.env.BucketClassfees,
    Body: file,
    Key: `${name}`,
    ContentEncoding: "base64",
    ContentType: type,
  };
  return s3.upload(params).promise();
}

//exports routes controller
exports.getClassfeesByID = (req, res, next, id) => {
  try {
    Classfees.findById(id).exec((err, classfees) => {
      if (err || !classfees) {
        return res.status(400).json({
          err: "No Classfees was found in Database",
        });
      }
      req.classfees = classfees;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createClassfees = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    } else {
      let classfees = new Classfees(fields);
      try {
        Classfees.findOne(
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
                err: "Classfees is Already Created",
              });
            }
            if (!data) {
              classfees.classfees = JSON.parse(fields.classfees);
              classfees.save((err, classfees) => {
                if (err) {
                  return res.status(400).json({
                    err: "Please Check Data!",
                  });
                }
                res.json(classfees);
              });
            }
          }
        );
      } catch (error) {
        console.log("Create Classfees Error", error);
      }
    }
  });
};

exports.getClassfees = (req, res) => {
  Classfees.findOne({ _id: req.classfees._id })
    .populate("school")
    .populate("session")
    .populate("class")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Classfees",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.updateClassfees = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    try {
      let classfees = req.classfees;
      classfees = _.extend(classfees, fields);
      if (fields.classfees) {
        classfees.classfees = JSON.parse(fields.classfees);
      }
      classfees.save((err, classfees) => {
        if (err) {
          return res.status(400).json({
            err: "Update classfees in Database is Failed",
          });
        }
        res.json(classfees);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllClassfees = (req, res) => {
  try {
    Classfees.find({ school: req.schooldoc._id })
      .populate("school")
      .populate("session")
      .populate("class")
      .sort({ createdAt: -1 })
      .then((classfees, err) => {
        if (err || !classfees) {
          return res.status(400).json({
            err: "Database Dont Have Classfees",
          });
        }
        return res.json(classfees);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllClassfeesCustome = (req, res) => {
  var classs = req.body.class;
  var session = req.body.session;
  try {
    Classfees.findOne({
      school: req.schooldoc._id,
      class: classs,
      session: session,
    })
      .populate("school")
      .populate("session")
      .populate("class")
      .sort({ createdAt: -1 })
      .then((classfees, err) => {
        if (err || !classfees) {
          return res.status(400).json({
            err: "Database Dont Have Classfees",
          });
        }
        return res.json(classfees);
      });
  } catch (error) {
    console.log(error);
  }
};


exports.deleteClassfees = (req, res) => {
  let classfees = req.classfees;
  try {
    classfees.remove((err, classfees) => {
      if (err || !classfees) {
        return res.status(400).json({
          err: "Can't Able To Delete classfees",
        });
      }
      return res.json({
        Massage: `Classfees is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
