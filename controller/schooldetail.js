//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
var aws = require("aws-sdk");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
const crypto = require("crypto");
const fs = require("fs");
//import require models
const schoolDetail = require("../model/schooldetail");
const schoolAdmin = require("../model/schoolAdmin");
const common = require("../config/common");


aws.config.update({
  accessKeyId: process.env.accessKeyID,
  secretAccessKey: process.env.secretAccessID,
  region: process.env.region,
});
const s3 = new aws.S3();

function uploadFile(file, name, type) {
  const params = {
    Bucket: process.env.Bucket,
    Body: file,
    Key: `SchoolImages/${name}`,
    ContentType: type,
  };
  return s3.upload(params).promise();
}

async function getFileStream(key) {
  try {
    const downloadparams = {
      Bucket: process.env.Bucket,
      Key: key,
      Expires: 604800,
    };
    var data = await s3.getSignedUrlPromise("getObject", downloadparams);
    return data;
  } catch (error) {
    return 2;
  }
}

//exports routes controller
exports.getSchoolDetailByDetailsID = (req, res, next, id) => {
  try {
    schoolDetail
      .findById(id)
      .populate("session")
      .exec((err, doc) => {
        if (err || !doc) {
          return common.sendJSONResponse(res, 0, "No School Detail was found in Database", null);
        } else {
          req.schooldoc = doc;
          next();
        }
      });
  } catch (error) {
    console.log(error);
    return common.sendJSONResponse(res, 0, "No School Detail was found in Database", null);
  }
};

exports.getSchoolDetailByID = (req, res, next, id) => {
  try {
    schoolDetail
      .findById(id)
      .populate("session")
      .exec((err, doc) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "No School Detail was found in Database",
          });
        }
        req.schooldoc = doc;
        next();
      });
  } catch (error) {
    console.log(error);
  }
};

exports.createSchoolDoc = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let schooldoc = new schoolDetail(fields);
    try {
      let plan = JSON.parse(fields.plan);
      let module = JSON.parse(fields.module);
      var base_module = [
        "School Profile Module",
        "Class, section and subject master",
        "Staff Management",
        "Department",
        "Fees Management Module",
        "School Calendar",
        "Time table Management",
        "Document Store",
        "Result Management",
        "Reports",
        "Question Paper editor",
        "Support",
        "Session",
        "Student Management",
        "Role and Permissions",
      ];
      module.map((data) => {
        base_module.push(data);
      });
      const unique = [...new Set(base_module)];
      schooldoc.module = unique;
      schooldoc.plan.name = plan.name;
      schooldoc.plan.duration = plan.duration;
      schooldoc.plan.price = plan.price;
      schooldoc.save((err, schooldoc) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            err: "Error Please Check Your Data!",
          });
        }
        try {
          var sqlnumber = crypto.randomBytes(3).toString("hex");
          var pass = crypto.randomBytes(3).toString("hex");
          const encryptedString = encryptor.encrypt(pass);
          var SID = schooldoc.abbreviation + "ADM" + sqlnumber;
          schoolAdmin.findById({ _id: schooldoc.admin }, async (err, admin) => {
            if (err) {
              return res.status(400).json({
                err: "Error in School Admin Data Please Check",
              });
            } else {
              admin.SID = SID;
              admin.temp = encryptedString;
              admin.password = pass;
              admin.school = schooldoc._id;
              var permission = {};
              var base_module = [
                "School Profile Module",
                "Class, section and subject master",
                "Staff Management",
                "Department",
                "Fees Management Module",
                "School Calendar",
                "Time table Management",
                "Document Store",
                "Result Management",
                "Reports",
                "Question Paper editor",
                "Support",
                "Session",
                "Student Management",
                "Role and Permissions",
              ];
              schooldoc.module.map(async (data) => {
                permission[data] = [
                  "view",
                  "add",
                  "edit",
                  "delete",
                  "export",
                  "import",
                ];
              });
              base_module.map(async (data) => {
                permission[data] = [
                  "view",
                  "add",
                  "edit",
                  "delete",
                  "export",
                  "import",
                ];
              });

              admin.permissions = permission;
              admin.save((err, updatedAdmin) => {
                if (err) {
                  console.log(err);
                  return res.status(400).json({
                    err: "Error in School Admin Data Please Check",
                  });
                } else {
                  res.json(schooldoc);
                }
              });
            }
          });
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getSchoolDoc = async (req, res) => {
  if (req.schooldoc.photo) {
    let temp = await getFileStream(req.schooldoc.photo);
    req.schooldoc.photo = temp;
  }
  return res.json(req.schooldoc);
};

exports.updateSchoolDoc = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let schooldoc = req.schooldoc;
    schooldoc = _.extend(schooldoc, fields);

    try {
      if (file.photo) {
        var content = await fs.readFileSync(file.photo.filepath);
        var photo_result = await uploadFile(
          content,
          file.photo.originalFilename,
          file.photo.mimetype
        );
        console.log(photo_result);
        schooldoc.photo = photo_result.Key;
      }
      if (fields.module) {
        schooldoc.module = JSON.parse(fields.module);
      }
      await schoolDetail.findOneAndUpdate(
        { _id: req.params.schoolID },
        { $set: { schooldoc } },
        { new: true, useFindAndModify: false },
      ).sort({ createdAt: -1 })
      .then((result, err) => {
          if (err || ! result) {
            console.log(err)
            return res.status(400).json({
              err: "Update schooldoc in Database is Failed",
            });
          } else {
            res.json(result);
          }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllSchoolDoc = (req, res) => {
  try {
    schoolDetail
      .populate("admin")
      .sort({ createdAt: -1 })
      .then((doc, err) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(doc);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.checkAbbreviation = (req, res) => {
  const keyword = req.body.keyword;
  try {
    schoolDetail.find({ abbreviation: keyword }).then((doc, err) => {
      if (err) {
        return res.status(400).json({
          err: "School Details have Problem",
        });
      } else {
        if (doc.length === 0) {
          return res.json({ valid: true });
        } else {
          return res.json({ valid: false });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};
exports.getAllSchoolDocActive = (req, res) => {
  try {
    schoolDetail
      .find({ status: "Active" })
      .populate("admin")
      .sort({ createdAt: -1 })
      .then((doc, err) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(doc);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllSchoolDocBlock = (req, res) => {
  try {
    schoolDetail
      .find({ status: "Block" })
      .populate("admin")
      .sort({ createdAt: -1 })
      .then((doc, err) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(doc);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteSchoolDoc = (req, res) => {
  let schooldoc = req.schooldoc;
  let admin = req.schooldoc.admin;
  try {
    schooldoc.remove((err, schooldoc) => {
      if (err || !schooldoc) {
        return res.status(400).json({
          err: "Can't Able To Delete schooldoc",
        });
      }
      schoolAdmin.deleteOne({ _id: admin });
      return res.json({
        Massage: `${schooldoc.schoolname} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.changeStatus = (req, res) => {
  const { status } = req.body;
  schoolDetail.updateOne(
    { _id: req.schooldoc._id },
    { $set: { status: status } },
    (err, updatedData) => {
      if (err || !updatedData) {
        return res.status(400).json({
          err: "Can't Able To Change School Status",
        });
      }
      return res.json(updatedData);
    }
  );
};
