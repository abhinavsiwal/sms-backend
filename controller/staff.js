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
const SalaryBreakup = require("../model/salary_breakup");
const AdvanceSalary = require("../model/advance_salary_approval");
const School = require("../model/schooldetail");
const common = require("../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const TempStaff = require("../model/temp_staff");
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
            createStaff(fields, file, function(response){
                if (response.err){
                    return res.status(400).json({
                        err: response.err,
                    })
                } else {
                    return res.status(200).json(response);
                }
            })
        }
    });
};

function createStaff(fields, file, callback){
    School.findOne({ _id: fields.school }, async (err, data) => {
        if (err) {
            callback({
                err: "Fetching abbreviation of school is failed!",
            });
        } else {
            Staff.findOne({ email: fields.email }, async (err, staff) => {
                if (err || staff) {
                    callback({
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
                                console.log(err);
                                callback({
                                    err: "Saving Staff is Failed! Please Check Your Data",
                                });
                            } else {
                                callback(staff);
                            }
                        });
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        }
    });
}

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


exports.salaryBreakup = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                staff: 'required',
                basic_salary: 'required',
                total_amount: 'required',
                department: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    Staff.find({
                        _id: ObjectId(fields.staff),
                    }).then(async (staff, err) => {
                        console.log(staff);
                        if (err || !staff) {
                            return res.status(400).json({
                                err: "Database Dont Have Staff",
                            });
                        }
                        if (parseInt(fields.total_amount) > staff.salary){
                            return res.status(400).json({
                                err: "Total amount must be less than or equals to staff salary",
                            });
                        }
                        if (fields._id){
                            SalaryBreakup.findOneAndUpdate(
                                {_id: ObjectId(fields._id)},
                                { $set: {
                                    staff: fields.staff,
                                    basic_salary: fields.basic_salary,
                                    total_amount: fields.total_amount,
                                    lta: fields.lta,
                                    hra: fields.hra,
                                    professional_tax: fields.professional_tax,
                                    other: fields.other,
                                    department: fields.department,
                                    school: req.params.schoolID,
                                } },
                                {new:true, useFindAndModify: false},
                            )
                            .sort({ createdAt: -1 })
                            .then((result, err) => {
                                if (err || ! result) {
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Problem in updating salary breakup. Please try again.",
                                    });
                                } else {
                                    return res.status(200).json(result);
                                }
                            });
                        } else {
                            var salary_breakup_data = new SalaryBreakup({
                                staff: fields.staff,
                                basic_salary: fields.basic_salary,
                                total_amount: fields.total_amount,
                                lta: fields.lta,
                                department: fields.department,
                                hra: fields.hra,
                                professional_tax: fields.professional_tax,
                                other: fields.other,
                                school: req.params.schoolID,
                            });
                            salary_breakup_data.save(function(err,result){
                                if (err){
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Problem in adding salary breakup. Please try again.",
                                    });
                                } else {
                                    return res.status(200).json(result);
                                }
                            })

                        }
                    })
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating salary breakup. Please try again.",
                    });
                }
            }
        }
    });
}

exports.salaryBreakupList = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    SalaryBreakup.find({ school: ObjectId(req.params.schoolID) })
                    .populate('department')
                    .populate('staff', 'firstname lastname gender _id email phone salary')
                    .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in fetching salary breakup list. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting salary breakup. Please try again.",
                    });
                }
            }
        }
    });
}


exports.applyAdvanceSalary = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                staff: 'required',
                amount: 'required',
                total_salary: 'required',
                percentage: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    Staff.find({
                        _id: ObjectId(fields.staff),
                    }).then(async (staff, err) => {
                        console.log(staff);
                        if (err || !staff) {
                            return res.status(400).json({
                                err: "Database Dont Have Staff",
                            });
                        }
                        if (parseInt(fields.total_amount) > parseInt(staff.total_salary)){
                            return res.status(400).json({
                                err: "Total salary must be less than or equals to staff salary",
                            });
                        }
                        if (fields._id){
                            AdvanceSalary.findOne({
                                _id: ObjectId(fields._id),
                            }).then(async (result, err) => {
                                if (err){
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Total amount must be less than or equals to staff salary",
                                    });
                                }
                                if (result.status == 'awaiting'){
                                    AdvanceSalary.findOneAndUpdate(
                                        {_id: ObjectId(fields._id)},
                                        { $set: {
                                            staff: fields.staff,
                                            amount: fields.amount,
                                            total_salary: fields.total_salary,
                                            percentage: fields.percentage,
                                            status: fields.status,
                                            school: req.params.schoolID,
                                        } },
                                        {new:true, useFindAndModify: false},
                                    )
                                    .sort({ createdAt: -1 })
                                    .then((result, err) => {
                                        if (err || ! result) {
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in updating salary request. Please try again.",
                                            });
                                        } else {
                                            return res.status(200).json(result);
                                        }
                                    });
                                } else {
                                    return res.status(400).json({
                                        err: "You are not authorized to update the request. Please add new request.",
                                    });
                                }
                            });
                        } else {
                            var salary_breakup_data = new AdvanceSalary({
                                staff: fields.staff,
                                amount: fields.amount,
                                total_salary: fields.total_salary,
                                percentage: fields.percentage,
                                status: 'awaiting',
                                school: req.params.schoolID,
                            });
                            salary_breakup_data.save(function(err,result){
                                if (err){
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Problem in adding salary request. Please try again.",
                                    });
                                } else {
                                    return res.status(200).json(result);
                                }
                            })

                        }
                    })
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating salary request. Please try again.",
                    });
                }
            }
        }
    });
}


exports.advanceSalaryRequestList = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    AdvanceSalary.find({ school: ObjectId(req.params.schoolID) })
                    .populate('staff', 'firstname lastname gender _id email phone salary')
                    .populate('approved_by', 'firstname lastname gender _id email phone')
                    .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in fetching advance salary request list. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in fetching advance salary request list. Please try again.",
                    });
                }
            }
        }
    });
}


exports.advanceSalaryStatusUpdate = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                _id: 'required',
                status: 'required|in:approved,declined',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    AdvanceSalary.findOne({
                        _id: ObjectId(fields._id),
                    }).then(async (result, err) => {
                        if (err){
                            console.log(err);
                            return res.status(400).json({
                                err: "Total amount must be less than or equals to staff salary",
                            });
                        }
                        if (result.status == 'awaiting'){
                            AdvanceSalary.findOneAndUpdate(
                                {_id: ObjectId(fields._id)},
                                { $set: {
                                    status: fields.status,
                                    approved_by: req.params.id,
                                    school: req.params.schoolID,
                                } },
                                {new:true, useFindAndModify: false},
                            )
                            .sort({ createdAt: -1 })
                            .then((result, err) => {
                                if (err || ! result) {
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Problem in updating salary request status. Please try again.",
                                    });
                                } else {
                                    return res.status(200).json(result);
                                }
                            });
                        } else {
                            return res.status(400).json({
                                err: "You are not authorized to update the request.",
                            });
                        }
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating salary request status. Please try again.",
                    });
                }
            }
        }
    });
}


exports.getStaffList = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var filter = {
                school: ObjectId(req.params.schoolID)
            };
            if (fields.department_id){
                filter.department = ObjectId(fields.department_id);
            }
            if (fields.SID){
                filter.SID = fields.SID;
            }
            if (fields.staff_name){
                // console.log('asd')
                var userRegex = new RegExp(fields.staff_name, 'i')
                console.log(userRegex)
                var filter = {
                    school: ObjectId(req.params.schoolID),
                    $or: [{ firstname: userRegex}, {lastname: userRegex}]
                }
                // filter.firstname = userRegex; //{ $regex: '.*' + fields.staff_name + '.*' };
                // filter.lastname = userRegex; //{ $regex: '.*' + fields.staff_name + '.*' };
            }
            Staff
                .find(filter)
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in adding fees. Please try again.",
                        });
                    } else {
                        return res.status(200).json(result);
                    }
                });
        }
    });
}


exports.bulkUpload = (req, res) => {
    const reader = require('xlsx');
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        } else {
            var rules = {
                department: 'required',
                session: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                if (files.documents) {
                    var file = reader.readFile(files.documents.filepath);
                    let data = []
                    const sheets = file.SheetNames
                    for (let i = 0; i < 1; i++)
                    {
                        const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
                        temp.forEach((res) => {
                            data.push(res)
                        });
                    }
                    var params = {};
                    var error = true;
                    var failed_staff = [];
                    asyncLoop(data,async function (item, next) { // It will be executed one by one
                        params = {
                            firstname: item['First Name'],
                            lastname: item['Last Name'],
                            email: item['Email'],
                            phone: item['Contact No.'],
                            alternate_phone: item['Alternate No. (o)'],
                            date_of_birth: item['Date of Birth'],
                            gender: item['Gender'],
                            birth_place: item['Birth Place'],
                            caste: item['Caste'],
                            religion: item['Religion'],
                            mother_tongue: item['Mother Toungue'],
                            bloodgroup: item['Blood Group'],
                            joining_date: item['Date of Joining'],
                            present_address: item['Present Address'],
                            permanent_state: item['Permanent State'],
                            permanent_country: item['Permanent Country'],
                            permanent_city: item['Permanent City'],
                            permanent_pincode: item['Permanent Pin Code'],
                            permanent_address: item['Permanent Address'],
                            state: item['Present State'],
                            city: item['Present City'],
                            country: item['Present Country'],
                            pincode: item['Present Pin Code'],
                            contact_person_name: item['Contact Person Name'],
                            contact_person_relation: item['Relation'],
                            contact_person_phone: item['Contact Person Contact No.'],
                            contact_person_address: item['Address'],
                            contact_person_state: item['State'],
                            contact_person_city: item['City'],
                            contact_person_country: item['Country'],
                            contact_person_pincode: item['Pin Code'],
                            job: item['Job Name'],
                            job_description: item['Job desription'],
                            salary: item['Salary'],
                            department: fields.department,
                            school: req.params.schoolID,
                            session: fields.session,
                            status: 'Active',
                        };
                        if ( ! params.firstname){
                            error = false;
                            console.log('1')
                        } else if ( ! params.lastname){
                            error = false;
                            console.log('2')
                        } else if ( ! params.email){
                            error = false;
                            console.log('3')
                        } else if ( ! params.phone){
                            error = false;
                            console.log('4')
                        } else if ( ! params.alternate_phone){
                            error = false;
                            console.log('5')
                        } else if ( ! params.date_of_birth){
                            error = false;
                            console.log('6')
                        } else if ( ! params.gender){
                            error = false;
                            console.log('7')
                        } else if ( ! params.birth_place){
                            error = false;
                            console.log('8')
                        } else if ( ! params.caste){
                            error = false;
                            console.log('9')
                        } else if ( ! params.religion){
                            error = false;
                            console.log('10')
                        } else if ( ! params.mother_tongue){
                            error = false;
                            console.log('11')
                        } else if ( ! params.bloodgroup){
                            error = false;
                            console.log('12')
                        } else if ( ! params.joining_date){
                            error = false;
                            console.log('13')
                        } else if ( ! params.present_address){
                            error = false;
                            console.log('14')
                        } else if ( ! params.permanent_state){
                            error = false;
                            console.log('15')
                        } else if ( ! params.permanent_country){
                            error = false;
                            console.log('16')
                        } else if ( ! params.permanent_city){
                            error = false;
                            console.log('17')
                        } else if ( ! params.permanent_pincode){
                            error = false;
                            console.log('18')
                        } else if ( ! params.permanent_address){
                            error = false;
                            console.log('19')
                        } else if ( ! params.state){
                            error = false;
                            console.log('20')
                        } else if ( ! params.city){
                            error = false;
                            console.log('21')
                        } else if ( ! params.country){
                            error = false;
                            console.log('22')
                        } else if ( ! params.pincode){
                            error = false;
                            console.log('23')
                        } else if ( ! params.contact_person_name){
                            error = false;
                            console.log('24')
                        } else if ( ! params.contact_person_relation){
                            error = false;
                            console.log('25')
                        } else if ( ! params.contact_person_phone){
                            error = false;
                            console.log('26')
                        } else if ( ! params.contact_person_address){
                            error = false;
                            console.log('27')
                        } else if ( ! params.contact_person_state){
                            error = false;
                            console.log('28')
                        } else if ( ! params.contact_person_city){
                            error = false;
                            console.log('29')
                        } else if ( ! params.contact_person_country){
                            error = false;
                            console.log('30')
                        } else if ( ! params.contact_person_pincode){
                            error = false;
                            console.log('31')
                        } else if ( ! params.job){
                            error = false;
                            console.log('32')
                        } else if ( ! params.job_description){
                            error = false;
                            console.log('33')
                        } else if ( ! params.salary){
                            error = false;
                            console.log('34')
                        }
                        if (error){
                            await createStaff(params, file, function(response){
                                if (response.err){
                                    var stu_data = new TempStaff(params);
                                    stu_data.save(function(err,result){
                                        if (err){
                                            console.log(err);
                                            return res.status(400).json({
                                                err: 'Upload staff failed'
                                            })
                                        } else {
                                            failed_staff.push(result);
                                            next();
                                        }
                                    });
                                } else {
                                    next();
                                }
                            });
                        } else {
                            var stu_data = new TempStaff(params);
                            stu_data.save(function(err,result){
                                if (err){
                                    console.log(err);
                                    return res.status(400).json({
                                        err: 'Upload staff failed'
                                    })
                                } else {
                                    failed_staff.push(result);
                                    next();
                                }
                            });
                        }

                    }, function (err) {
                        return res.status(200).json({failed_staff: failed_staff});
                    });
                } else {
                    return res.status(400).json({
                        err: "Document file is required",
                    });
                }
            }
        }
    });
}


exports.fetchStaffList = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var filter = {
                school: ObjectId(req.params.schoolID)
            };

            if (fields.staff_name){
                // console.log('asd')
                var userRegex = new RegExp(fields.staff_name, 'i')
                var filter = {
                    school: ObjectId(req.params.schoolID),
                    $or: [{ firstname: userRegex}, {lastname: userRegex}]
                }
                // filter.firstname = userRegex; //{ $regex: '.*' + fields.staff_name + '.*' };
                // filter.lastname = userRegex; //{ $regex: '.*' + fields.staff_name + '.*' };
            }
            if (fields.department_id){
                filter.department = ObjectId(fields.department_id);
            }
            if (fields.SID){
                filter.SID = fields.SID;
            }
            Staff
                .find(filter)
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in adding fees. Please try again.",
                        });
                    } else {
                        return res.status(200).json(result);
                    }
                });
        }
    });
}


