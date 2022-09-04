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
                Student.findOne({ email: fields.email }, async (err, stds) => {
                    if (err || stds) {
                        return res.status(400).json({
                            err: "Student Email ID is Already Registered",
                        });
                    } else {
                        if (fields.roll_number) {
                            student.find({ roll_number: fields.roll_number }).then(async (result, err) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Update student in Database is Failed",
                                    });
                                } else if (result) {
                                    return res.status(400).json({
                                        err: "Roll number already assigned to another student",
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
                                            Student.findById(fields.connectedID).exec((err, student) => {
                                                if (err || !student) {
                                                    return res.status(400).json({
                                                        err: "No Connected Student was found in Database",
                                                    });
                                                }
                                                fields.parent_SID = student.parent_SID;
                                                fields.parent_temp = student.temp;
                                                fields.parent_encry_password = student.parent_encry_password;
                                            });
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
                                                return res.json(students);
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
                                    Student.findById(fields.connectedID).exec((err, student) => {
                                        if (err || !student) {
                                            return res.status(400).json({
                                                err: "No Connected Student was found in Database",
                                            });
                                        }
                                        fields.parent_SID = student.parent_SID;
                                        fields.parent_temp = student.temp;
                                        fields.parent_encry_password = student.parent_encry_password;
                                    });
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
                                        return res.json(students);
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
                    let temp = await getFileStream(student[i].photo);
                    student[i].tempPhoto = temp;
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
                    let temp = await getFileStream(student[i].photo);
                    student[i].tempPhoto = temp;
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
                    let temp = await getFileStream(student[i].photo);
                    student[i].tempPhoto = temp;
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
        switch (type) {
            case "parent":
                try {
                    Student.findOne({ parent_email: email })
                        .sort({ createdAt: -1 })
                        .then((student, err) => {
                            if (err) {
                                return res.status(400).json({
                                    err: "Finding Parent Data is Failed!",
                                });
                            }
                            if (!student) {
                                return res.status(400).json({
                                    status: false,
                                });
                            }
                            var resp = {
                                status: true,
                                id: student._id,
                                firstname: student.firstname,
                                lastname: student.lastname,
                                email: student.email,
                            };
                            return res.json(resp);
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
                                return res.status(400).json({
                                    err: "Finding Guardian Data is Failed!",
                                });
                            }
                            if (!student) {
                                return res.status(400).json({
                                    status: false,
                                });
                            }
                            var resp = {
                                status: true,
                                id: student._id,
                                firstname: student.firstname,
                                lastname: student.lastname,
                                email: student.email,
                            };
                            return res.json(resp);
                        });
                } catch (error) {
                    console.log(error);
                }
                break;
            default:
                return res.status(400).json({
                    err: "This is not valid type to check connection!",
                });
                break;
        }
    } catch (error) {
        console.log(error);
    }
};

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
