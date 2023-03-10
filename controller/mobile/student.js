//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
const crypto = require("crypto");
var aws = require("aws-sdk");
const fs = require("fs");
//import require models
const Student = require("../../model/student");
const Notifications = require("../../model/notifications");
const School = require("../../model/schooldetail");
const common = require("../../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const asyncLoop = require('node-async-loop');

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
        __filename: `${name}`,
        key: "studentImage/" + name,
        ContentType: type,
    };
    return s3.upload(params).promise();
}

//exports routes controller

exports.getStudent = (req, res) => {
    Student.findOne({ _id: req.student._id })
        .populate("class")
        .populate("school")
        .populate("section")
        .populate("session")
        .then((data, err) => {
            if (err || !data) {
                return common.sendJSONResponse(res, 0, "Student data not available", null);
            } else {
                var output = { ...data.toObject()}
                common.getFileStreamCall(output.photo, function(response){
                    if (response){
                        output.photo_url = response;
                    } else {
                        output.photo_url = null;
                    }
                    if (output.school.photo){
                        common.getFileStreamCall(output.school.photo, function(response){
                            if (response){
                                output.school.photo_url = response;
                            } else {
                                output.school.photo_url = null;
                            }
                            return common.sendJSONResponse(res, 1, "Student data fetched successfully", output);
                        });
                    } else {
                        output.school.photo_url = null;
                        return common.sendJSONResponse(res, 1, "Student data fetched successfully", output);
                    }
                })
            }
        });
};

exports.updateStudentDocument = (req, res) => {
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
                Student.updateOne(
                    { _id: req.student._id },
                    {
                        $push: {
                            documents: [
                                (name = fields.documents_name),
                                (desciption = fields.documents_description),
                                (link = link.Location),
                            ],
                        },
                    },
                    (err, student) => {
                        if (err) {
                            return res.status(400).json({
                                err: "Update student in Database is Failed",
                            });
                        }
                        res.json(student);
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

exports.updateStudent = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        if (fields.roll_number){
            student.find({roll_number: fields.roll_number, class: ObjectId(fields.class), section: ObjectId(fields.section), session: ObjectId(fields.session)}).then((result, err) => {
                if (err){
                    console.log(err);
                    return res.status(400).json({
                        err: "Update student in Database is Failed",
                    });
                } else if (result.length > 0) {
                    return res.status(400).json({
                        err: "Roll number already assigned to another student",
                    });
                } else {
                    let student = req.student;
                    student = _.extend(student, fields);
                    try {
                        student.save((err, student) => {
                            if (err) {
                                return res.status(400).json({
                                    err: "Update student in Database is Failed",
                                });
                            }
                            res.json(student);
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        } else {
            let student = req.student;
            student = _.extend(student, fields);
            try {
                student.save((err, student) => {
                    if (err) {
                        return res.status(400).json({
                            err: "Update student in Database is Failed",
                        });
                    }
                    res.json(student);
                });
            } catch (error) {
                console.log(error);
            }
        }
    });
};

exports.updateStudentPassword = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        Student.findOne({ SID: fields.SID }).then((std, err) => {
            if (err || !std) {
                return res.status(400).json({
                    err: "Database Dont Have Admin",
                });
            }
            try {
                var pass = fields.password;
                const encryptedString = encryptor.encrypt(pass);
                std.temp = encryptedString;
                std.password = pass;
                std.save((err, student) => {
                    if (err) {
                        return res.status(400).json({
                            err: "Update student in Database is Failed",
                        });
                    }
                    res.json(student);
                });
            } catch (error) {
                console.log(error);
            }
        });
    });
};
exports.updateParentPassword = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        Student.findOne({ parent_SID: fields.SID }).then((parent, err) => {
            if (err || !std) {
                return res.status(400).json({
                    err: "Database Dont Have This parent Details",
                });
            }
            try {
                var pass = fields.password;
                const encryptedString = encryptor.encrypt(pass);
                parent.parent_temp = encryptedString;
                parent.parent_password = pass;
                parent.save((err, parents) => {
                    if (err) {
                        return res.status(400).json({
                            err: "Update Parent Password in Database is Failed",
                        });
                    }
                    Student.updateMany(
                        { parent_SID: fields.SID },
                        {
                            $set: {
                                parent_encry_password: parents.parent_encry_password,
                                parent_temp: parents.parent_temp,
                                parent_salt: parents.parent_salt,
                            },
                        },
                        (err, data) => {
                            if (err) {
                                return res.status(400).json({
                                    err: "Update Parent Password in Database is Failed",
                                });
                            }
                            res.json(parents);
                        }
                    );
                });
            } catch (error) {
                console.log(error);
            }
        });
    });
};

exports.getAllStudent = (req, res) => {
    try {
        Student.find({ school: req.schooldoc._id })
            .populate("session")
            .sort({ createdAt: -1 })
            .then((student, err) => {
                if (err || !student) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                student.map(async (data) => {
                    data.salt = undefined;
                    data.encry_password = undefined;
                    data.temp = encryptor.decrypt(data.temp);
                });

                return res.json(student);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.getAllStudentByFilter = (req, res) => {
    let classs = req.body.class;
    let sections = req.body.section;
    try {
        Student.find({
            class: classs,
            section: sections,
            school: req.schooldoc._id,
        })
            // .populate("session")
            // .populate("class")
            // .populate("school")
            // .populate("section")
            // .populate("session")
            // .populate("issuedBooks")
            // .populate({
            //   path: "issuedBooks",
            //   populate: {
            //     path: "book",
            //   },
            // })
            .select('_id firstname lastname gender email phone')
            .sort({ createdAt: -1 })
            .then(async (student, err) => {
                if (err || !student) {
                    return common.sendJSONResponse(res, 0, "Student data not available", []);
                } else {
                    for (let i = 0; i < student.length; i++) {
                        let temp = await common.getFileStream(student[i].photo);
                        student[i].tempPhoto = temp;
                        student[i].salt = undefined;
                        student[i].encry_password = undefined;
                        student[i].temp = encryptor.decrypt(student[i].temp);
                    }
                    return common.sendJSONResponse(res, 1, "Student list fetched successfully", student);
                }
            });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in fetching student data. Please try again.", null);
    }
};

exports.getStudentFromSID = (req, res) => {
    var StudentSID = req.body.SID;
    try {
        Student.find({ SID: StudentSID })
            .sort({ createdAt: -1 })
            .then((student, err) => {
                if (err || !student) {
                    return res.status(400).json({
                        err: "Database Dont Have Student",
                    });
                }
                student.map(async (data) => {
                    data.salt = undefined;
                    data.encry_password = undefined;
                    data.temp = encryptor.decrypt(data.temp);
                });
                return res.json(student);
            });
    } catch (error) {
        console.log(error);
    }
};


exports.uploadFile = (req, res) => {
    let form = new formidable.IncomingForm();
    var path = "";
    var files = [];
    var name = [];
    form
    .on('field', function(field, value) {
        path = value;
    })
    .on('file', function(field, file) {
        files.push(file);
    })
    .once('end',function() {
        asyncLoop(files,function (item, next) { // It will be executed one by one
            fs.readFile(item.filepath,function (err, data) {
                var file_name = common.random_string(20);
                var ext = item.originalFilename.split('.');
                // common.uploadFileS3(data, path + '/' + file_name + '.' + ext[ext.length-1], item.mimetype,function(response){
                common.uploadFileS3(data,file_name + '.' + ext[ext.length-1], item.mimetype,function(response){
                    name.push(file_name + '.' + ext[ext.length-1]);
                    next();
                })
            });
        }, function (err) {
            return common.sendJSONResponse(res, 1, "File uploaded successfully.", name);
        });
    });
    form.parse(req);
}


exports.notificationsList = (req, res) => {
    var rules = {
        student: 'required',
        page: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            var cutoff = new Date();
            cutoff.setHours(cutoff.getHours() - 2160);
            Notifications.find({student: ObjectId(req.body.student), "createdAt": {$gt: cutoff}, read: 'N'}).exec(async function (error, unread_counts) {
                var unread_notifications = unread_counts.length;
                Notifications.find({student: ObjectId(req.body.student), "createdAt": {$gt: cutoff}}).sort({createdAt: -1}).skip((req.body.page-1) * 10).limit(10).then(result => {
                    if (result.length > 0){
                        var notification_ids = [];
                        result.forEach(res => {
                            notification_ids.push(res._id);
                        })
                        //Update unread notifications
                        Notifications.updateMany({"_id": { "$in": notification_ids }, "read":'N'}, { $set: {read: 'Y' } }, function(upd_err, upd_readed) {
                            return common.sendJSONResponse(res, 1, "Notifications list fetched successfully", {list: result, unread_counts: unread_notifications});
                        });
                    } else {
                        return common.sendJSONResponse(res, 2, "Notifications list not available", {list: [], unread_counts: unread_notifications});
                    }
                }).catch(error => {
                    console.log(error);
                    return common.sendJSONResponse(res, 0, "Problem in fetching notification list. Please try again.", null);
                });
            });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching notification list. Please try again.", null);
        }
    }
};



