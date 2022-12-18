//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const crypto = require("crypto");
var aws = require("aws-sdk");
const fs = require("fs");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
//import require models
const Staff = require("../../model/staff");
const School = require("../../model/schooldetail");
const common = require("../../config/common");

// //s3 aws
// aws.config.update({
//   accessKeyId: process.env.accessKeyID,
//   secretAccessKey: process.env.secretAccessID,
//   region: process.env.region,
// });
// const s3 = new aws.S3();

// //s3 upload file function
// function uploadFile(file, name, type) {
//   const params = {
//     Bucket: process.env.Bucket,
//     Body: file,
//     __filename: `${name}`,
//     key: "staffImage/" + name,
//     ContentEncoding: "base64",
//     ContentType: type,
//   };
//   return s3.upload(params).promise();
// }

exports.getStaff = (req, res) => {
    Staff.findOne({ _id: req.staff._id })
        .populate("department")
        .populate("school")
        .populate("session")
        .populate("schoolClassTeacher")
        .populate("head")
        .populate("subject")
        .then((data, err) => {
            if (err || !data) {
                return common.sendJSONResponse(res, 0, "Staff data not available", null);
            } else {
                var output = { ...data.toObject()}
                common.getFileStreamCall(output.photo, function(response){
                    output.photo_url = response;
                    if (output.school.photo){
                        common.getFileStreamCall(output.school.photo, function(response){
                            output.school.photo_url = response;
                            return common.sendJSONResponse(res, 1, "Staff data fetched successfully", output);
                        });
                    } else {
                        output.school.photo_url = "";
                        return common.sendJSONResponse(res, 1, "Staff data fetched successfully", output);
                    }
                })
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

exports.updateStaff = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }

        try {
            let staff = req.staff;
            if (fields.subject) {
                staff.subject = JSON.parse(fields.subject);
            }
            staff = _.extend(staff, fields);
            staff.save((err, staff) => {
                if (err) {
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

exports.getStaffFromSID = (req, res) => {
    var StaffSID = req.body.SID;
    try {
        Staff.find({ SID: StaffSID })
            .sort({ createdAt: -1 })
            .then((staff, err) => {
                if (err || !staff) {
                    return res.status(400).json({
                        err: "Database Dont Have Staff",
                    });
                }
                staff.map(async (data) => {
                    data.salt = undefined;
                    data.encry_password = undefined;
                    data.temp = encryptor.decrypt(data.temp);
                });
                return res.json(staff);
            });
    } catch (error) {
        console.log(error);
    }
};
exports.getStaffByDepartment = async (req, res) => {
    var rules = {
        department_id: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        let departmentId = req.body.department_id;
        let staff;
        try {
            Staff.find({
                department: departmentId,
                school: req.schooldoc._id,
            })
                .populate({
                    path: "issuedBooks",
                    populate: {
                        path: "book",
                    },
                })
                .sort({ createdAt: -1 })
                .then(async (staff, err) => {
                    // console.log(staff);
                    if (err || !staff) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Staff not available", null);
                    }
                    for (let i = 0; i < staff.length; i++) {
                        let temp = await common.getFileStream(staff[i].photo);
                        if (temp){
                            staff[i].tempPhoto = temp;
                        } else {
                            staff[i].tempPhoto = null;
                        }
                        staff[i].salt = undefined;
                        staff[i].encry_password = undefined;
                        staff[i].temp = encryptor.decrypt(staff[i].temp);
                    }
                    return common.sendJSONResponse(res, 1, "Staff list fetched successfully", staff);
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching staff details. Please try again.", null);
        }
    }
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
                    if (err){
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "Staff not available", null);
                } else {
                    for (let i = 0; i < staff.length; i++) {
                        let temp = await common.getFileStream(staff[i].photo);
                        if (temp){
                            staff[i].tempPhoto = temp;
                        } else {
                            staff[i].tempPhoto = null;
                        }
                        staff[i].salt = undefined;
                        staff[i].encry_password = undefined;
                        staff[i].temp = encryptor.decrypt(staff[i].temp);
                    }
                    return common.sendJSONResponse(res, 1, "Staff fetched successfully", staff);
                }
            });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in fetching staff. Please try again.", null);
    }
};
