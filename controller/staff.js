//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const crypto = require("crypto");
var aws = require("aws-sdk");
const fs = require("fs");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
//import require models
const Staff = require("../model/staff");
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
    Bucket: process.env.Bucket,
    Body: file,
    Key: `StaffImages/${name}`,
    ContentType: type,
  };
  return s3.upload(params).promise();
}
function uploadFileCapture(file, name, type) {
  const params = {
    Bucket: process.env.Bucket,
    Body: file,
    Key: `StaffImages/${name}.jpeg`,
    ContentEncoding: "base64",
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
exports.getStaffByID = (req, res, next, id) => {
  try {
    Staff.findById(id).exec((err, staff) => {
      if (err || !staff) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.staff = staff;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createStaff = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    } else {
      School.findOne({ _id: fields.school }, async (err, data) => {
        if (err) {
          return res.status(400).json({
            err: "Fetching abbreviation of school is failed!",
          });
        } else {
          Staff.findOne({ email: fields.email }, async (err, staff) => {
            if (err || staff) {
              return res.status(400).json({
                err: "Email ID is Already Registered",
              });
            } else {
              try {
                var sqlnumber = crypto.randomBytes(3).toString("hex");
                var pass = crypto.randomBytes(3).toString("hex");
                const encryptedString = encryptor.encrypt(pass);
                var SID = data.abbreviation + "STF" + sqlnumber;
                fields.SID = SID;
                fields.temp = encryptedString;
                fields.password = pass;
              } catch (error) {
                console.log(error);
              }
              try {
                if (file.photo) {
                  var content = await fs.readFileSync(file.photo.filepath);
                  var photo_result = await uploadFile(
                    content,
                    file.photo.originalFilename,
                    file.photo.mimetype
                  );
                  console.log(photo_result);
                  fields.photo = photo_result.Key;
                }
                if (fields.capture) {
                  async function getImgBuffer(base64) {
                    const base64str = base64.replace(
                      /^data:image\/\w+;base64,/,
                      ""
                    );
                    return Buffer.from(base64str, "base64");
                  }
                  var base64Data = await getImgBuffer(fields.capture);
                  var photo_result = await uploadFileCapture(
                    base64Data,
                    SID,
                    "image/jpeg"
                  );
                  fields.photo = photo_result.Key;
                }
                let staff = new Staff(fields);
                if (fields.subject) {
                  staff.subject = JSON.parse(fields.subject);
                }
                var permission = {};
                permission["School Profile"] = ["view"];
                staff.baseFields = permission;
                staff.save((err, staff) => {
                  if (err) {
                    return res.status(400).json({
                      err: "Saving Staff is Failed! Please Check Your Data",
                    });
                  }
                  res.json(staff);
                });
              } catch (error) {
                console.log(error);
              }
            }
          });
        }
      });
    }
  });
};

exports.getStaff = (req, res) => {
  Staff.findOne({ _id: req.staff._id })
    .populate("department")
    .populate("school")
    .populate("session")
    .populate("schoolClassTeacher")
    .populate("head")
    .populate("assign_role")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Staff",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.updateStaffPassword = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    Staff.findOne({ SID: fields.SID }).then((stf, err) => {
      if (err || !stf) {
        return res.status(400).json({
          err: "Database Dont Have Admin",
        });
      }

      try {
        var pass = fields.password;
        const encryptedString = encryptor.encrypt(pass);
        stf.temp = encryptedString;
        stf.password = pass;
        stf.save((err, staff) => {
          if (err) {
            return res.status(400).json({
              err: "Update Staff in Database is Failed",
            });
          }
          res.json(staff);
        });
      } catch (error) {
        console.log(error);
      }
    });
  });
};

exports.updateStaffDocument = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    if (file.documents) {
      var data = fs.readFileSync(file.documents.filepath);
      var link = await uploadFile(data, fields.documents_name);
      try {
        Staff.updateOne(
          { _id: req.staff._id },
          {
            $push: {
              documents: [
                (name = fields.documents_name),
                (desciption = fields.documents_description),
                (link = link.Location),
              ],
            },
          },
          (err, staff) => {
            if (err) {
              return res.status(400).json({
                err: "Update Staff in Database is Failed",
              });
            }
            res.json(staff);
          }
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      return res.status(400).json({
        err: "Update student Document in Database is Failed",
      });
    }
  });
};

exports.updateStaff = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    try {
      let staff = req.staff;
      var oldKey = staff.photo;
      if (fields.subject) {
        console.log(fields.subject);
        fields.subject = JSON.parse(fields.subject);
        // staff.subject = JSON.parse(fields.subject);
      }
      staff = _.extend(staff, fields);
      if (file.photo) {
        var content = await fs.readFileSync(file.photo.filepath);
        var photo_result = await uploadFile(
          content,
          file.photo.originalFilename,
          file.photo.mimetype
        );
        staff.photo = photo_result.Key;
      }
      staff.save((err, staff) => {
        if (err) {
          console.log(err);
          return res.status(400).json({
            err: "Update staff in Database is Failed",
          });
        }
        res.json(staff);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllStaff = (req, res) => {
  try {
    Staff.find({ school: req.schooldoc._id })
      .populate("department")
      .populate("school")
      .populate("session")
      .populate("schoolClassTeacher")
      .populate("head")
      .populate("assign_role")
      .populate("subject")
      .sort({ createdAt: -1 })
      .then(async (staff, err) => {
        if (err || !staff) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        for (let i = 0; i < staff.length; i++) {
          let temp = await getFileStream(staff[i].photo);
          staff[i].tempPhoto = temp;
          staff[i].salt = undefined;
          staff[i].encry_password = undefined;
          staff[i].temp = encryptor.decrypt(staff[i].temp);
        }
        return res.json(staff);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllStaffAssignClassTeacher = (req, res) => {
  try {
    Staff.find({ school: req.schooldoc._id })
      .populate("department")
      .populate("school")
      .populate("session")
      .populate("schoolClassTeacher")
      .populate("head")
      .populate("assign_role")
      .sort({ createdAt: -1 })
      .then(async (staff, err) => {
        if (err || !staff) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        for (let i = 0; i < staff.length; i++) {
          let temp = await getFileStream(staff[i].photo);
          staff[i].tempPhoto = temp;
          staff[i].salt = undefined;
          staff[i].encry_password = undefined;
          staff[i].temp = encryptor.decrypt(staff[i].temp);
        }
        var data = staff.filter((data) => data.assign_role.name === "Teacher");
        var main = data.filter((data) => data.isClassTeacher === false);
        return res.json(main);
      });
  } catch (error) {
    console.log(error);
  }
};
exports.getAllStaffAssignHead = (req, res) => {
  try {
    Staff.find({ school: req.schooldoc._id })
      .populate("department")
      .populate("school")
      .populate("session")
      .populate("schoolClassTeacher")
      .populate("head")
      .populate("assign_role")
      .sort({ createdAt: -1 })
      .then(async (staff, err) => {
        if (err || !staff) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        for (let i = 0; i < staff.length; i++) {
          let temp = await getFileStream(staff[i].photo);
          staff[i].tempPhoto = temp;
          staff[i].salt = undefined;
          staff[i].encry_password = undefined;
          staff[i].temp = encryptor.decrypt(staff[i].temp);
        }
        var data = staff.filter((data) => data.subject !== undefined);
        var main = data.filter((data) => data.isHead === false);
        return res.json(main);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteStaff = (req, res) => {
  let staff = req.staff;
  try {
    staff.remove((err, staff) => {
      if (err || !staff) {
        return res.status(400).json({
          err: "Can't Able To Delete staff",
        });
      }
      return res.json({
        Massage: `${staff.firstname} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getStaffFromSID = (req, res) => {
  var StaffSID = req.body.SID;
  try {
    Staff.find({ SID: StaffSID })
      .populate("department")
      .populate("school")
      .populate("session")
      .populate("schoolClassTeacher")
      .populate("head")
      .populate("assign_role")
      .sort({ createdAt: -1 })
      .then(async (staff, err) => {
        if (err || !staff) {
          return res.status(400).json({
            err: "Database Dont Have Staff",
          });
        }
        for (let i = 0; i < staff.length; i++) {
          let temp = await getFileStream(staff[i].photo);
          staff[i].tempPhoto = temp;
          staff[i].salt = undefined;
          staff[i].encry_password = undefined;
          staff[i].temp = encryptor.decrypt(staff[i].temp);
        }
        return res.json(staff);
      });
  } catch (error) {
    console.log(error);
  }
};

// Get All Staff by Department
exports.getStaffByDepartment = async (req, res) => {
  let departmentId = req.body.departmentId;
  let staff;
  try {
    Staff.find({
      department: departmentId,
      school: req.schooldoc._id,
    })
      .populate("department")
      .populate({
        path: "issuedBooks",
        populate: {
          path: "book",
        },
      })
      .populate("school")
      .populate("session")
      .populate("schoolClassTeacher")
      .populate("head")
      .populate("assign_role")

      .sort({ createdAt: -1 })
      .then(async (staff, err) => {
        console.log(staff);
        if (err || !staff) {
          return res.status(400).json({
            err: "Database Dont Have Staff",
          });
        }
        for (let i = 0; i < staff.length; i++) {
          let temp = await getFileStream(staff[i].photo);
          staff[i].tempPhoto = temp;
          staff[i].salt = undefined;
          staff[i].encry_password = undefined;
          staff[i].temp = encryptor.decrypt(staff[i].temp);
        }
        return res.json(staff);
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      err: "Database Dont Have Staff",
    });
  }
};
