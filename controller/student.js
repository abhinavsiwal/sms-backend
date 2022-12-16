//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
const crypto = require("crypto");
var aws = require("aws-sdk");
const fs = require("fs");
//import require models
const Student = require("../model/student");
const TempStudent = require("../model/temp_student");
const School = require("../model/schooldetail");
const common = require('../config/common');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const asyncLoop = require('node-async-loop');

const pdf = require('html-pdf');


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
        Key: `StudentImages/${name}`,
        ContentEncoding: "base64",
        ContentType: type,
    };
    return s3.upload(params).promise();
}

function uploadFileCapture(file, name, type) {
    const params = {
        Bucket: process.env.Bucket,
        Body: file,
        Key: `StudentImages/${name}.jpeg`,
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
exports.getStudentByID = (req, res, next, id) => {
    try {
        Student.findById(id)
            .populate("class")
            .populate("section")
            .populate("session")
            .exec((err, student) => {
                if (err || !student) {
                    return res.status(400).json({
                        err: "No Student was found in Database",
                    });
                }
                req.student = student;
                next();
            });
    } catch (error) {
        console.log(error);
    }
};

exports.createStudent = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, file) => {
        console.log(err, fields);
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        }
        // await create_student(fields, file, function(response){
        //     console.log(fields,file)
        //     if (response.err){
        //         return res.status(400).json(response);
        //     } else {
        //         return res.status(200).json(response);
        //     }
        // });
        School.findOne({ _id: fields.school }, async (err, data) => {
            if (err) {
                return res.status(400).json({
                    err: "Fetching abbreviation of school is failed!",
                })
            } else {
                Student.findOne({ email: fields.email }, async (err, stds) => {
                    if ((err || stds) && fields.email) {
                        return res.status(400).json({
                            err: "Student Email ID is Already Registered",
                        });
                    } else {
                        if (fields.roll_number) {
                            Student.find({roll_number: fields.roll_number, class: ObjectId(fields.class), section: ObjectId(fields.section), session: ObjectId(fields.session)}).then(async (result, err) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Update student in Database is Failed",
                                    });
                                    return;
                                } else if (result.length>0) {
                                    return res.status(400).json({
                                        err: "Roll number already assigned to another student",
                                    });
                                    return;
                                } else {
                                    try {
                                        var sqlnumber = crypto.randomBytes(3).toString("hex");
                                        var pass = crypto.randomBytes(3).toString("hex");
                                        const encryptedString = encryptor.encrypt(pass);
                                        var SID = data.abbreviation + "STD" + sqlnumber;
                                        fields.SID = SID;
                                        fields.temp = encryptedString;
                                        fields.password = pass;
                                    } catch (error) {
                                        console.log(error);
                                    }
                                    if (fields.connected === true) {
                                        try {
                                            var student = await Student.findById(fields.connectedID).exec();
                                                if (err || ! student) {
                                                    return res.status(400).json({
                                                        err: "No Connected Student was found in Database",
                                                    });
                                                    return;
                                                } else {
                                                    fields.parent_SID = student.parent_SID;
                                                    fields.parent_temp = student.temp;
                                                    fields.parent_encry_password = student.parent_encry_password;
                                                }
                                        } catch (error) {
                                            console.log(
                                                "Student Find in Create with connection with other",
                                                error
                                            );
                                        }
                                    } else {
                                        try {
                                            var sqlnumber = crypto.randomBytes(3).toString("hex");
                                            var pass = crypto.randomBytes(3).toString("hex");
                                            const encryptedString = encryptor.encrypt(pass);
                                            var SID = data.abbreviation + "PAR" + sqlnumber;
                                            fields.parent_SID = SID;
                                            fields.parent_temp = encryptedString;
                                            fields.parent_password = pass;
                                        } catch (error) {
                                            console.log(error);
                                        }
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
                                        let student = new Student(fields);
                                        var permission = {};
                                        var base_module = [
                                            "School Profile Module",
                                            "Fees Management Module",
                                            "School Calendar",
                                            "Time table Management",
                                            "Document Store",
                                            "Result Management",
                                            "Reports",
                                            "Question Paper editor",
                                            "Student Management",
                                            "Ecommerce",
                                            "Canteen Management",
                                            "Leave Management",
                                        ];
                                        base_module.map(async (data) => {
                                            permission[data] = ["view"];
                                        });
                                        student.baseFields = permission;
                                        student.ParentbaseFields = permission;
                                        student.save((err, students) => {
                                            if (err) {
                                                console.log(err);
                                                return res.status(400).json({
                                                    err: "Please Check Your Data!",
                                                });
                                            } else {
                                                return res.status(200).json(students);
                                                return;
                                            }
                                        });
                                    } catch (error) {
                                        console.log(error);
                                    }
                                }
                            });
                        } else {
                            try {
                                var sqlnumber = crypto.randomBytes(3).toString("hex");
                                var pass = crypto.randomBytes(3).toString("hex");
                                const encryptedString = encryptor.encrypt(pass);
                                var SID = data.abbreviation + "STD" + sqlnumber;
                                fields.SID = SID;
                                fields.temp = encryptedString;
                                fields.password = pass;
                            } catch (error) {
                                console.log(error);
                            }
                            if (fields.connected === true) {
                                try {
                                    var student = await Student.findById(fields.connectedID).exec();
                                    if (err || ! student) {
                                        return res.status(400).json({
                                            err: "No Connected Student was found in Database",
                                        });
                                        return;
                                    }
                                    fields.parent_SID = student.parent_SID;
                                    fields.parent_temp = student.temp;
                                    fields.parent_encry_password = student.parent_encry_password;
                                } catch (error) {
                                    console.log(
                                        "Student Find in Create with connection with other",
                                        error
                                    );
                                }
                            } else {
                                try {
                                    var sqlnumber = crypto.randomBytes(3).toString("hex");
                                    var pass = crypto.randomBytes(3).toString("hex");
                                    const encryptedString = encryptor.encrypt(pass);
                                    var SID = data.abbreviation + "PAR" + sqlnumber;
                                    fields.parent_SID = SID;
                                    fields.parent_temp = encryptedString;
                                    fields.parent_password = pass;
                                } catch (error) {
                                    console.log(error);
                                }
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
                                let student = new Student(fields);
                                var permission = {};
                                var base_module = [
                                    "School Profile Module",
                                    "Fees Management Module",
                                    "School Calendar",
                                    "Time table Management",
                                    "Document Store",
                                    "Result Management",
                                    "Reports",
                                    "Question Paper editor",
                                    "Student Management",
                                    "Ecommerce",
                                    "Canteen Management",
                                    "Leave Management",
                                ];
                                base_module.map(async (data) => {
                                    permission[data] = ["view"];
                                });
                                student.baseFields = permission;
                                student.ParentbaseFields = permission;
                                student.save((err, students) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(400).json({
                                            err: "Please Check Your Data!",
                                        });
                                        return;
                                    } else {
                                        return res.status(400).json(students);
                                        return;
                                    }
                                });
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                })
            }
        });
    });
}

function create_student(fields, file, callback){
    School.findOne({ _id: fields.school }, async (err, data) => {
        if (err) {
            callback({
                err: "Fetching abbreviation of school is failed!",
            })
        } else {
            Student.findOne({ email: fields.email, school: ObjectId(fields.school) }, async (err, stds) => {
                if ((err || stds) && fields.email) {
                    callback({
                        err: "Student Email ID is Already Registered",
                    });
                } else {
                    if (fields.roll_number) {
                        Student.find({roll_number: fields.roll_number, class: ObjectId(fields.class), section: ObjectId(fields.section), session: ObjectId(fields.session)}).then(async (result, err) => {
                            if (err) {
                                console.log(err);
                                callback({
                                    err: "Update student in Database is Failed",
                                });
                                return;
                            } else if (result.length>0) {
                                callback({
                                    err: "Roll number already assigned to another student",
                                });
                                return;
                            } else {
                                try {
                                    var sqlnumber = crypto.randomBytes(3).toString("hex");
                                    var pass = crypto.randomBytes(3).toString("hex");
                                    const encryptedString = encryptor.encrypt(pass);
                                    var SID = data.abbreviation + "STD" + sqlnumber;
                                    fields.SID = SID;
                                    fields.temp = encryptedString;
                                    fields.password = pass;
                                } catch (error) {
                                    console.log(error);
                                }
                                if (fields.connected === true) {
                                    try {
                                        var student = await Student.findById(fields.connectedID).exec();
                                            if (err || ! student) {
                                                callback({
                                                    err: "No Connected Student was found in Database",
                                                });
                                                return;
                                            } else {
                                                fields.parent_SID = student.parent_SID;
                                                fields.parent_temp = student.temp;
                                                fields.parent_encry_password = student.parent_encry_password;
                                            }
                                    } catch (error) {
                                        console.log(
                                            "Student Find in Create with connection with other",
                                            error
                                        );
                                    }
                                } else {
                                    try {
                                        var sqlnumber = crypto.randomBytes(3).toString("hex");
                                        var pass = crypto.randomBytes(3).toString("hex");
                                        const encryptedString = encryptor.encrypt(pass);
                                        var SID = data.abbreviation + "PAR" + sqlnumber;
                                        fields.parent_SID = SID;
                                        fields.parent_temp = encryptedString;
                                        fields.parent_password = pass;
                                    } catch (error) {
                                        console.log(error);
                                    }
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
                                    let student = new Student(fields);
                                    var permission = {};
                                    var base_module = [
                                        "School Profile Module",
                                        "Fees Management Module",
                                        "School Calendar",
                                        "Time table Management",
                                        "Document Store",
                                        "Result Management",
                                        "Reports",
                                        "Question Paper editor",
                                        "Student Management",
                                        "Ecommerce",
                                        "Canteen Management",
                                        "Leave Management",
                                    ];
                                    base_module.map(async (data) => {
                                        permission[data] = ["view"];
                                    });
                                    student.baseFields = permission;
                                    student.ParentbaseFields = permission;
                                    student.save((err, students) => {
                                        if (err) {
                                            console.log(err);
                                            callback({
                                                err: "Please Check Your Data!",
                                            });
                                            return;
                                        } else {
                                            callback(students);
                                            return;
                                        }
                                    });
                                } catch (error) {
                                    console.log(error);
                                }
                            }
                        });
                    } else {
                        try {
                            var sqlnumber = crypto.randomBytes(3).toString("hex");
                            var pass = crypto.randomBytes(3).toString("hex");
                            const encryptedString = encryptor.encrypt(pass);
                            var SID = data.abbreviation + "STD" + sqlnumber;
                            fields.SID = SID;
                            fields.temp = encryptedString;
                            fields.password = pass;
                        } catch (error) {
                            console.log(error);
                        }
                        if (fields.connected === true) {
                            try {
                                var student = await Student.findById(fields.connectedID).exec();
                                if (err || ! student) {
                                    callback({
                                        err: "No Connected Student was found in Database",
                                    });
                                    return;
                                }
                                fields.parent_SID = student.parent_SID;
                                fields.parent_temp = student.temp;
                                fields.parent_encry_password = student.parent_encry_password;
                            } catch (error) {
                                console.log(
                                    "Student Find in Create with connection with other",
                                    error
                                );
                            }
                        } else {
                            try {
                                var sqlnumber = crypto.randomBytes(3).toString("hex");
                                var pass = crypto.randomBytes(3).toString("hex");
                                const encryptedString = encryptor.encrypt(pass);
                                var SID = data.abbreviation + "PAR" + sqlnumber;
                                fields.parent_SID = SID;
                                fields.parent_temp = encryptedString;
                                fields.parent_password = pass;
                            } catch (error) {
                                console.log(error);
                            }
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
                            let student = new Student(fields);
                            var permission = {};
                            var base_module = [
                                "School Profile Module",
                                "Fees Management Module",
                                "School Calendar",
                                "Time table Management",
                                "Document Store",
                                "Result Management",
                                "Reports",
                                "Question Paper editor",
                                "Student Management",
                                "Ecommerce",
                                "Canteen Management",
                                "Leave Management",
                            ];
                            base_module.map(async (data) => {
                                permission[data] = ["view"];
                            });
                            student.baseFields = permission;
                            student.ParentbaseFields = permission;
                            student.save((err, students) => {
                                if (err) {
                                    console.log(err);
                                    callback({
                                        err: "Please Check Your Data!",
                                    });
                                    return;
                                } else {
                                    callback(students);
                                    return;
                                }
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            })
        }
    });
}


function check_sibblings(request_data, callback){
    Student.findById(fields.connectedID).exec((err, student) => {
        if (err) {
            callback({
                err: "No Connected Student was found in Database",
            });
            return;
        } else if ( ! student){
            var sqlnumber = crypto.randomBytes(3).toString("hex");
            var pass = crypto.randomBytes(3).toString("hex");
            const encryptedString = encryptor.encrypt(pass);
            var SID = data.abbreviation + "PAR" + sqlnumber;
            fields.parent_SID = SID;
            fields.parent_temp = encryptedString;
            fields.parent_password = pass;
        } else {
            fields.parent_SID = student.parent_SID;
            fields.parent_temp = student.temp;
            fields.parent_encry_password = student.parent_encry_password;
        }
    });
}

exports.checkRollNumber = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                roll_number: 'required',
                class: 'required',
                section: 'required',
                session: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                // console.log({roll_number: fields.roll_number, class: ObjectId(fields.class), section: ObjectId(fields.section), session: ObjectId(fields.session)})
                Student.find({roll_number: fields.roll_number, class: ObjectId(fields.class), section: ObjectId(fields.section), session: ObjectId(fields.session)}).then((result, err) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in checking roll number. Please try again.",
                        });
                    } else if (result.length>0) {
                        return res.status(400).json({
                            err: "Roll number already assigned to another student",
                        });
                    } else {
                        return res.status(200).json({roll_number: fields.roll_number});
                    }
                });
            }
        }
    });
}

exports.getStudent = (req, res) => {
    Student.findOne({ _id: req.student._id })
        .populate("class")
        .populate("school")
        .populate("section")
        .populate("session")
        .then((data, err) => {
            if (err || !data) {
                return res.status(400).json({
                    err: "Can't able to find the Student",
                });
            } else {
                return res.json(data);
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

    form.parse(req, async (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }

        var student = req.student;
        var oldKey = student.photo;
        student = _.extend(student, fields);
        // console.log(student);
        try {
            if (file.photo) {
                var content = await fs.readFileSync(file.photo.filepath);
                var photo_result = await uploadFile(
                    content,
                    file.photo.originalFilename,
                    file.photo.mimetype
                );
                student.photo = photo_result.Key;
            }
            student.save((err, student) => {
                if (err) {
                    console.log(err);
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
            if (err || !parent) {
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
            .populate("class")
            .populate("school")
            .populate("section")
            .populate("session")
            .sort({ createdAt: -1 })
            .then(async (student, err) => {
                if (err || !student) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                for (let i = 0; i < student.length; i++) {
                    if (student[i].photo){
                        let temp = await getFileStream(student[i].photo);
                        student[i].tempPhoto = temp;
                    } else {
                        student[i].tempPhoto = null;
                    }
                    student[i].salt = undefined;
                    student[i].encry_password = undefined;
                    student[i].temp = encryptor.decrypt(student[i].temp);
                }

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
            .populate("session")
            .populate("class")
            .populate("school")
            .populate("section")
            .populate("session")
            // .populate("issuedBooks")
            .populate({
                path: "issuedBooks",
                populate: {
                    path: "book",
                },
            })
            .sort({ createdAt: -1 })
            .then(async (student, err) => {
                if (err || !student) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                for (let i = 0; i < student.length; i++) {
                    if (student[i].photo){
                        let temp = await getFileStream(student[i].photo);
                        student[i].tempPhoto = temp;
                    } else {
                        student[i].tempPhoto = null;
                    }
                    student[i].salt = undefined;
                    student[i].encry_password = undefined;
                    student[i].temp = encryptor.decrypt(student[i].temp);
                    student[i].parent_temp = encryptor.decrypt(student[i].parent_temp);
                }

                return res.json(student);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.getStudentFromSID = (req, res) => {
    var StudentSID = req.body.SID;
    try {
        Student.find({ SID: StudentSID })
            .populate("session")
            .populate("class")
            .populate("school")
            .populate("section")
            .populate("session")
            .sort({ createdAt: -1 })
            .then(async (student, err) => {
                if (err || !student) {
                    return res.status(400).json({
                        err: "Database Dont Have Student",
                    });
                }
                for (let i = 0; i < student.length; i++) {
                    if (student[i].photo){
                        let temp = await getFileStream(student[i].photo);
                        student[i].tempPhoto = temp;
                    } else {
                        student[i].tempPhoto = null;
                    }
                    student[i].salt = undefined;
                    student[i].encry_password = undefined;
                    student[i].temp = encryptor.decrypt(student[i].temp);
                }
                return res.json(student);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.checkConnection = (req, res) => {
    var email = req.body.email;
    var type = req.body.type;
    try {
        // switch (type) {
        //     case "parent":
        //         try {
        //             Student.findOne({ parent_email: email })
        //                 .sort({ createdAt: -1 })
        //                 .then((student, err) => {
        //                     if (err) {
        //                         return res.status(400).json({
        //                             err: "Finding Parent Data is Failed!",
        //                         });
        //                     }
        //                     if (!student) {
        //                         return res.status(400).json({
        //                             status: false,
        //                         });
        //                     }
        //                     var resp = {
        //                         status: true,
        //                         id: student._id,
        //                         firstname: student.firstname,
        //                         lastname: student.lastname,
        //                         email: student.email,
        //                     };
        //                     return res.json(resp);
        //                 });
        //         } catch (error) {
        //             console.log(error);
        //         }
        //         break;
        //     case "guardian":
        //         try {
        //             Student.findOne({ guardian_email: email })
        //                 .sort({ createdAt: -1 })
        //                 .then((student, err) => {
        //                     if (err) {
        //                         return res.status(400).json({
        //                             err: "Finding Guardian Data is Failed!",
        //                         });
        //                     }
        //                     if (!student) {
        //                         return res.status(400).json({
        //                             status: false,
        //                         });
        //                     }
        //                     var resp = {
        //                         status: true,
        //                         id: student._id,
        //                         firstname: student.firstname,
        //                         lastname: student.lastname,
        //                         email: student.email,
        //                     };
        //                     return res.json(resp);
        //                 });
        //         } catch (error) {
        //             console.log(error);
        //         }
        //         break;
        //     default:
        //         return res.status(400).json({
        //             err: "This is not valid type to check connection!",
        //         });
        //         break;
        // }
        checkConnections(email, type, function(response){
            if (response){
                res.status(200).json(response);
            } else {
                return res.status(400).json({
                    err: "This is not valid type to check connection!",
                });
            }
        })
    } catch (error) {
        console.log(error);
    }
};


function checkConnections(email, type, callback)
{
    switch (type) {
        case "parent":
            try {
                Student.findOne({ parent_email: email })
                    .sort({ createdAt: -1 })
                    .then((student, err) => {
                        if (err) {
                            callback(null);
                            // return res.status(400).json({
                            //     err: "Finding Parent Data is Failed!",
                            // });
                        } else if (!student) {
                            callback(null);
                        } else {
                            var resp = {
                                status: true,
                                id: student._id,
                                firstname: student.firstname,
                                lastname: student.lastname,
                                email: student.email,
                            };
                            callback(resp);
                            // return res.json(resp);
                        }
                    });
            } catch (error) {
                console.log(error);
            }
            break;
        case "guardian":
            try {
                Student.findOne({ guardian_email: email })
                    .sort({ createdAt: -1 })
                    .then((student, err) => {
                        if (err) {
                            callback(null);
                            // return res.status(400).json({
                            //     err: "Finding Guardian Data is Failed!",
                            // });
                        } else if (!student) {
                            callback(null);
                            // return res.status(400).json({
                            //     status: false,
                            // });
                        } else {
                            var resp = {
                                status: true,
                                id: student._id,
                                firstname: student.firstname,
                                lastname: student.lastname,
                                email: student.email,
                            };
                            callback(resp);
                        }
                    });
            } catch (error) {
                console.log(error);
            }
            break;
        default:
            callback(null);
            // return res.status(400).json({
            //     err: "This is not valid type to check connection!",
            // });
            break;
    }
}

exports.deleteStudent = (req, res) => {
    let student = req.student;
    try {
        student.remove((err, student) => {
            if (err || !student) {
                return res.status(400).json({
                    err: "Can't Able To Delete student",
                });
            }
            return res.json({
                Massage: `${student.firstname} is Deleted SuccessFully`,
            });
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
                class: 'required',
                section: 'required',
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
                    var failed_students = [];
                    asyncLoop(data,async function (item, next) { // It will be executed one by one
                        if (item['Parent/Guardian Flag'] == 'Parent'){
                            params = {
                                firstname: item['First Name'],
                                lastname: item['Last Name'],
                                email: item['Student Email (o)'],
                                phone: item['Phone(0)'],
                                alternate_phone: item['Alternate Phone no (0)'],
                                aadhar_number: item['Aadhar Card(o)'],
                                date_of_birth: item['Date Of Birth'],
                                gender: item['Gender'],
                                birth_place: item['Birth Place'],
                                caste: item['Caste'],
                                religion: item['Religion'],
                                mother_tongue: item['Mother Toungue'],
                                bloodgroup: item['Blood Group'],
                                nationality: item['Nationality'],
                                joining_date: item['Enrollment Date'],
                                previous_school: item['Previous School(o)'],
                                present_address: item['Present Address'],
                                permanent_address: item['Permanent Addresss(o)'],
                                permanent_state: item['Permanent State(o)'],
                                permanent_country: item['Permanent Country (o)'],
                                permanent_city: item['Permanent City(o)'],
                                permanent_pincode: item['Pin Code (o)'],
                                state: item['State'],
                                city: item['City'],
                                country: item['Country'],
                                pincode: item['Pin Code'],
                                father_name: item['Father Firstname'],
                                father_last_name: item['Father Lastname'],
                                father_phone: item['Father Phone No. (o)'],
                                father_dob: item['Father DOB(o)'],
                                mother_name: item['Mother Firstname'],
                                mother_last_name: item['Mother Last Name'],
                                mother_phone: item['Mother Phone No. (o)'],
                                mother_blood_group: item['Email(o)'],
                                mother_dob: item['Mother DOB(o)'],
                                parent_email: item['Parent Email'],
                                class: fields['class'],
                                roll_number: item['Roll No.'],
                                section: fields.section,
                                school: req.params.schoolID,
                                session: fields.session,
                                status: 'Active',
                            };
                        } else {
                            params = {
                                firstname: item['First Name'],
                                lastname: item['Last Name'],
                                email: item['Student Email (o)'],
                                phone: item['Phone(0)'],
                                alternate_phone: item['Alternate Phone no (0)'],
                                aadhar_number: item['Aadhar Card(o)'],
                                date_of_birth: item['Date Of Birth'],
                                gender: item['Gender'],
                                birth_place: item['Birth Place'],
                                caste: item['Caste'],
                                religion: item['Religion'],
                                mother_tongue: item['Mother Toungue'],
                                bloodgroup: item['Blood Group'],
                                nationality: item['Nationality'],
                                joining_date: item['Enrollment Date'],
                                previous_school: item['Previous School(o)'],
                                present_address: item['Present Address'],
                                permanent_address: item['Permanent Addresss(o)'],
                                permanent_state: item['Permanent State(o)'],
                                permanent_country: item['Permanent Country (o)'],
                                permanent_city: item['Permanent City(o)'],
                                permanent_pincode: item['Pin Code (o)'],
                                state: item['State'],
                                city: item['City'],
                                country: item['Country'],
                                pincode: item['Pin Code'],
                                guardian_name: item['Guardian Firstname (o)'],
                                guardian_last_name: item['Guardian Lastname (o)'],
                                guardian_phone: item['Guardian Phone (o)'],
                                guardian_email: item['Guardian Email (o)'],
                                guardian_dob: item['Guardian DOB (o)'],
                                class: fields['class'],
                                roll_number: item['Roll No.'],
                                section: fields.section,
                                school: req.params.schoolID,
                                session: fields.session,
                                status: 'Active',
                            };
                        }
                        if ( ! item['First Name']){
                            error = false;
                            console.log(1);
                        } else if ( ! item['Last Name']){
                            console.log(2);
                            error = false;
                        } else if ( ! item['Enrollment Date']){
                            console.log(3);
                            error = false;
                        } else if ( ! item['Date Of Birth']){
                            console.log(4);
                            error = false;
                        } else if ( ! item['Gender']){
                            console.log(5);
                            error = false;
                        } else if ( ! item['Birth Place']){
                            console.log(6);
                            error = false;
                        } else if ( ! item['Caste']){
                            console.log(7);
                            error = false;
                        } else if ( ! item['Religion']){
                            console.log(8);
                            error = false;
                        } else if ( ! item['Blood Group']){
                            console.log(9);
                            error = false;
                        } else if ( ! item['Roll No.']){
                            console.log(10);
                            error = false;
                        } else if ( ! item['Pin Code']){
                            console.log(11);
                            error = false;
                        } else if ( ! item['Present Address']){
                            console.log(12);
                            error = false;
                        } else if ( ! item['Country']){
                            console.log(13);
                            error = false;
                        } else if ( ! item['State']){
                            console.log(14);
                            error = false;
                        } else if ( ! item['City']){
                            console.log(15);
                            error = false;
                        } else if ( ! item['Nationality']){
                            console.log(16);
                            error = false;
                        } else if ( ! item['Mother Toungue']){
                            console.log(17);
                            error = false;
                        }
                        if (error){
                            var type = 'parent';
                            var email = params.parent_email;
                            if (params.guardian_email){
                                type = 'guardian';
                                email = params.guardian_email;
                            }
                            checkConnections(email, type, async function(response){
                                if (response){
                                    params.connected = true;
                                    params.connectedID = response.id;
                                }
                                await create_student(params, file, function(response){
                                    console.log(response)
                                    if (response.err){
                                        var stu_data = new TempStudent(params);
                                        stu_data.save(function(err,result){
                                            if (err){
                                                console.log(err);
                                                return res.status(400).json({
                                                    err: 'Upload student failed'
                                                })
                                            } else {
                                                result.reason = response.err;
                                                failed_students.push(result);
                                                next();
                                            }
                                        });
                                    } else {
                                        next();
                                    }
                                });
                            });
                        } else {
                            var stu_data = new TempStudent(params);
                            stu_data.save(function(err,result){
                                if (err){
                                    console.log(err);
                                    return res.status(400).json({
                                        err: 'Upload student failed'
                                    });
                                } else {
                                    failed_students.push(result);
                                    next();
                                }
                            });
                        }
                    }, function (err) {
                        return res.status(200).json({failed_students: failed_students});
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



exports.studentList = (req, res) => {
    try {
        var params = {
            school: ObjectId(req.params.schoolID)
        }
        if (req.body.name){
            // console.log('asd')
            var userRegex = new RegExp(req.body.name, 'i')
            params = {
                school: ObjectId(req.params.schoolID),
                $or: [{ firstname: userRegex}, {lastname: userRegex}]
            }
        }
        if (req.body.SID){
            params.SID = req.body.SID;
        }
        if (req.body.class){
            params.class = req.body.class;
        }
        if (req.body.section){
            params.section = req.body.section;
        }
        Student.find(params)
            .populate("session")
            .populate("class")
            .populate("school")
            .populate("section")
            .populate("session")
            .sort({ createdAt: -1 })
            .then(async (student, err) => {
                if (err || !student) {
                    return res.status(400).json({
                        err: "Database Dont Have Student",
                    });
                }
                for (let i = 0; i < student.length; i++) {
                    if (student[i].photo){
                        let temp = await getFileStream(student[i].photo);
                        student[i].tempPhoto = temp;
                    } else {
                        student[i].tempPhoto = null;
                    }
                    student[i].salt = undefined;
                    student[i].encry_password = undefined;
                    student[i].temp = encryptor.decrypt(student[i].temp);
                }
                return res.json(student);
            });
    } catch (error) {
        console.log(error);
    }
};


exports.generateIdCard = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                student_id: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                Student.findOne({_id: ObjectId(fields.student_id)})
                .populate('school')
                .populate('class')
                .populate('section')
                .then(async (result, err) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in checking student data. Please try again.",
                        });
                    } else {
                        var photo = await common.getFileStream(result.photo);
                        var school_logo = await common.getFileStream(result.school.photo);
                        var html = `
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Document</title>
                            </head>
                            <body>
                                <div className='id__card__wrapper' style="
                                    background: linear-gradient(white 46%, #c1fafb 100%);
                                    border-radius:12px ;
                                    max-width: 500px;
                                    margin: auto;
                                    box-shadow: 0 0 15px 0 rgb(0 0 0 / 50%);
                                    border-radius: 10px;
                                    overflow: hidden;  "
                                >
                                <header style="
                                    background-color: #133f86;
                                    color:white;
                                    letter-spacing: 10px;
                                    padding: 25px 10px;
                                    text-transform: uppercase;
                                    font-family: Georgia, 'Times New Roman', Times, serif;
                                    ">
                                    <img style="
                                        float: left;
                                        max-height: 50px;
                                        margin-left: 5px;
                                    "
                                    src='${school_logo}' alt='logo'/>
                                    <div style="
                                        text-align: center;
                                    ">
                                    <div>BETHESDA ACADEMY</div>
                                    <div>Identity Card</div>
                                    </div>
                                </header>
                                <div>
                                    <div style="width: 30%;float:left;max-width: 120px;min-height: 172px;max-height: 172px;border-radius: 15px;margin-left: 27px;box-sizing: border-box;margin-top: 17px;overflow: hidden;">
                                    <img style="box-sizing:border-box;width: 100%;filter: none;
                                        border-radius: 15px;" src="${photo}" alt="" />
                                    </div>
                                    <ul style="padding: 15px 20px; width: 60%;margin: 0;list-style: none;float: right;">
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Name :</strong> <span style="font-weight: 700;color: black;">John Doe</span></li>
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Class :</strong> <span style="font-weight: 700;color: black;">Class-A</span></li>
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Section :</strong> <span style="font-weight: 700;color: black;">Section A</span></li>
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Roll No. :</strong> <span style="font-weight: 700;color: black;">123456</span></li>
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Gender :</strong> <span style="font-weight: 700;color: black;">Male</span></li>
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Date of birth :</strong> <span style="font-weight: 700;color: black;">25/03/2017</span></li>
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Contact No. :</strong> <span style="font-weight: 700;color: black;">+91 9612963449</span></li>
                                    <li style="
                                            color: rgba(0, 0, 0, 0.85);
                                            font-size: 14px;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                            font-variant: tabular-nums;
                                            line-height: 1.5715;
                                    "><strong style="  color: #133f86;">Blood Group :</strong> <span style="font-weight: 700;color: black;">O+</span></li>
                                    </ul>
                                </div>
                                <footer style="padding: 10px 20px;line-height: 1.6;text-transform: uppercase;background-color: white;clear: both;">
                                    <div>
                                    <span >
                                        S. Hengcham, Bethesda Mun, K. Mongjang Road, B.P.O - Koite Churachandpur, Manipur - XXXXXX - +91 XXXXX-XXXXX
                                    </span>
                                    </div>
                                </footer>
                                </div>
                            </body>
                            </html>
                        `;
                        var pdfFilePath = `./pdf/${fields.student_id}.pdf`;
                        var options = { format: 'A4' };

                        pdf.create(html, options).toFile(pdfFilePath, function(err, res2) {
                            if (err){
                                console.log(err);
                                res.status(500).send("Some kind of error...");
                                return;
                            }
                            fs.readFile(pdfFilePath , function (err,data){
                                res.contentType("application/pdf");
                                res.send(data);
                            });
                        });
                    }
                })
            }
        }
    });
}
