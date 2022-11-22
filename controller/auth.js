//import all require dependencies
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
const formidable = require("formidable");

//import require models
const Student = require("../model/student");
const Staff = require("../model/staff");
const superAdmin = require("../model/superAdmin");
const schoolAdmin = require("../model/schoolAdmin");
const Roles = require("../model/role");
const common = require('../config/common');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const asyncLoop = require('node-async-loop');

//exports routes controller
exports.signin = (req, res) => {
    const { email, password } = req.body;

    try {
        superAdmin.findOne({ email }, (err, adminData) => {
            if (err || !adminData) {
                return res.status(400).json({
                    err: "EmailID is Not Register",
                });
            } else {
                if (!adminData || !adminData.autheticate(password)) {
                    return res.status(401).json({
                        err: "EmailID and Password is not match",
                    });
                } else {
                    var currentTime = new Date();
                    currentTime.setHours(currentTime.getHours() + 1);
                    const token = jwt.sign({ _id: adminData._id }, process.env.SECRET);
                    res.cookie("token", token);
                    const { _id, firstname, lastname, email, permissions, role } =
                        adminData;
                    return res.json({
                        token,
                        expiryTime: currentTime,
                        user: { _id, firstname, lastname, email, permissions, role },
                    });
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
};

exports.schoolSignin = (req, res) => {

    // let form = new formidable.IncomingForm();
    // form.keepExtensions = true;

    // form.parse(req, async(err, fields, file) => {
    //   console.log(fields)
    const { SID, password } = req.body;
    console.log(SID, password);
    var user = SID.slice(3, 6);
    try {
        switch (user) {
            case "STD":
                try {
                    Student.findOne({ SID })
                        .populate("school")
                        .populate("role")
                        .exec((err, Data) => {
                            if (err || !Data) {
                                return res.status(400).json({
                                    err: "Student is Not Register",
                                });
                            } else {
                                if (!Data || !Data.autheticate(password)) {
                                    return res.status(401).json({
                                        err: "SID and Password is not match",
                                    });
                                } else {
                                    var currentTime = new Date();
                                    currentTime.setHours(currentTime.getHours() + 2);
                                    const token = jwt.sign(
                                        { _id: Data._id, user: "student" },
                                        process.env.SECRET
                                    );
                                    res.cookie("token", token);
                                    const {
                                        _id,
                                        firstname,
                                        lastname,
                                        email,
                                        phone,
                                        baseFields,
                                        school,
                                        SID,
                                        section,
                                    } = Data;
                                    return res.json({
                                        token,
                                        expiryTime: currentTime,
                                        user: {
                                            _id,
                                            user: "student",
                                            firstname,
                                            lastname,
                                            email,
                                            phone,
                                            school: school && school._id,
                                            schoolStatus: school && school.status,
                                            schoolStartExpire: school && school.startDate,
                                            schoolEndExpire: school && school.endDate,
                                            permissions: baseFields,
                                            SID,
                                            section,
                                            class: Data.class,
                                            Data,
                                        },
                                    });
                                }
                            }
                        });
                } catch (error) {
                    console.log(error);
                }
                break;
            case "STF":
                try {
                    Staff
                        .findOne({ SID })
                        .populate("school")
                        .populate("assign_role")
                        .exec(async (err, Data) => {
                            // console.log(Data);
                            if (err || !Data) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Staff is Not Register",
                                });
                            } else {
                                if (!Data || !Data.autheticate(password)) {
                                    return res.status(401).json({
                                        err: "EmailID and Password is not match",
                                    });
                                } else {
                                    var currentTime = new Date();
                                    currentTime.setHours(currentTime.getHours() + 2);
                                    const token = jwt.sign(
                                        { _id: Data._id, user: "staff" },
                                        process.env.SECRET
                                    );
                                    res.cookie("token", token);
                                    const {
                                        _id,
                                        firstname,
                                        lastname,
                                        email,
                                        phone,
                                        assign_role,
                                        baseFields,
                                        school,
                                        SID,
                                        department,
                                        isHead,
                                        isClassTeacher,
                                    } = Data;
                                    var newPermission = {
                                        ...assign_role.permissions,
                                        ...baseFields,
                                    };
                                    return res.json({
                                        token,
                                        expiryTime: currentTime,
                                        user: {
                                            _id,
                                            user: "staff",
                                            firstname,
                                            lastname,
                                            email,
                                            phone,
                                            SID,
                                            school: school && school._id,
                                            schoolStatus: school && school.status,
                                            schoolStartExpire: school && school.startDate,
                                            schoolEndExpire: school && school.endDate,
                                            permissions: newPermission,
                                            department,
                                            isHead,
                                            isClassTeacher,
                                            Data,
                                        },
                                    });
                                }
                            }
                        });
                } catch (error) {
                    console.log(error);
                }
                break;
            case "ADM":
                try {
                    schoolAdmin
                        .findOne({ SID })
                        .populate("school")
                        .exec(function (err, adminData) {
                            if (err || !adminData) {
                                return res.status(400).json({
                                    err: "Admin is Not Register",
                                });
                            } else {
                                if (!adminData || !adminData.autheticate(password)) {
                                    return res.status(401).json({
                                        err: "EmailID and Password is not match",
                                    });
                                } else {
                                    var defaultPermissions = [{
                                        "delete": 1,
                                        "name": "Teacher",
                                        "school": adminData.school._id,
                                        "permissions": {
                                            "School Profile Module": [
                                                "add",
                                                "view",
                                                "edit",
                                                "delete",
                                                "export",
                                                "import"
                                            ],
                                            "Class, section and subject master": [
                                                "add",
                                                "view",
                                                "edit",
                                                "delete"
                                            ],
                                            "Staff Management": [
                                                "add",
                                                "edit",
                                                "view",
                                                "delete"
                                            ],
                                            "Department": [
                                                "add",
                                                "edit",
                                                "view",
                                                "delete"
                                            ],
                                            "Fees Management Module": [
                                                "add",
                                                "edit",
                                                "delete",
                                                "view"
                                            ],
                                            "School Calendar": [
                                                "add",
                                                "edit",
                                                "delete",
                                                "view"
                                            ],
                                            "Time table Management": [
                                                "add",
                                                "edit",
                                                "delete",
                                                "view"
                                            ],
                                            "Document Store": [
                                                "add",
                                                "edit",
                                                "delete",
                                                "view"
                                            ],
                                            "Result Management": [
                                                "add",
                                                "edit",
                                                "delete",
                                                "view"
                                            ],
                                            "Student Management": [
                                                "add",
                                                "edit",
                                                "delete",
                                                "view"
                                            ],
                                            "Transportation management": [],
                                            "Library Management": [
                                                "view",
                                                "edit",
                                                "add",
                                                "delete",
                                                "export",
                                                "import"
                                            ],
                                            "Canteen Management": [],
                                            "Leave Management": [
                                                "add",
                                                "edit",
                                                "view",
                                                "delete",
                                                "export",
                                                "import"
                                            ],
                                            "Ecommerce": [],
                                            "Role and Permissions": [],
                                            "Session": [],
                                            "Support": [],
                                            "Question Paper editor": [
                                                "add",
                                                "edit",
                                                "view",
                                                "delete"
                                            ],
                                            "Reports": [
                                                "add",
                                                "edit",
                                                "view",
                                                "delete"
                                            ]
                                        }
                                    },{
                                        "delete": 1,
                                        "name": "Transportation",
                                        "school": adminData.school._id,
                                    },{
                                        "delete": 1,
                                        "name": "Library",
                                        "school": adminData.school._id,
                                        "permissions": {
                                            "Library Management": [
                                                "add",
                                                "edit",
                                                "view",
                                                "delete"
                                            ]
                                        }
                                    },{
                                        "delete": 1,
                                        "name": "Canteen",
                                        "school": adminData.school._id,
                                        "permissions": {
                                            "Staff Management": [],
                                            "Canteen Management": [
                                            "view"
                                            ]
                                        }
                                    },{
                                        "delete": 1,
                                        "name": "Hostel Management",
                                        "school": adminData.school._id,
                                    },{
                                        "delete": 1,
                                        "name": "Accounts",
                                        "school": adminData.school._id,
                                    }];

                                    asyncLoop(defaultPermissions,function (item, next) { // It will be executed one by one
                                        Roles.findOne({name: item.name, school: ObjectId(item.school)})
                                        .then(async (result, err) => {
                                            if ( ! result){
                                                var _roles = new Roles(item);
                                                _roles.save(function(err,result){
                                                    next();
                                                });
                                            } else {
                                                next();
                                            }
                                        });
                                    }, function (err) {
                                        var currentTime = new Date();
                                        currentTime.setHours(currentTime.getHours() + 2);
                                        const token = jwt.sign(
                                            { _id: adminData._id, user: "schoolAdmin" },
                                            process.env.SECRET
                                        );
                                        res.cookie("token", token);
                                        const {
                                            _id,
                                            firstname,
                                            lastname,
                                            email,
                                            phone,
                                            role,
                                            school,
                                            permissions,
                                        } = adminData;
                                        return res.json({
                                            token,
                                            expiryTime: currentTime,
                                            user: {
                                                _id,
                                                firstname,
                                                lastname,
                                                email,
                                                user: "schoolAdmin",
                                                phone,
                                                role,
                                                permissions,
                                                schoolStatus: school && school.status,
                                                schoolStartExpire: school && school.startDate,
                                                schoolEndExpire: school && school.endDate,
                                                school: school && school._id,
                                                module: school && school.module,
                                            },
                                        });
                                    });
                            }
                        }
            });
        } catch (error) {
            console.log(error);
        }
        break;
      case "PAR":
        try {
            Student.findOne({ parent_SID: SID })
                .populate("school")
                .exec(function (err, parentData) {
                    if (err || !parentData) {
                        return res.status(400).json({
                            err: "Parent is Not Register",
                        });
                    } else {
                        if (!parentData || !parentData.parent_autheticate(password)) {
                            return res.status(401).json({
                                err: "SID and Password is not match",
                            });
                        } else {
                            var currentTime = new Date();
                            currentTime.setHours(currentTime.getHours() + 2);
                            const token = jwt.sign(
                                { _id: parentData._id, user: "parent" },
                                process.env.SECRET
                            );
                            res.cookie("token", token);
                            Student.find({ parent_SID: SID }).select('_id SID firstname lastname gender email phone class section')
                                .populate("class")
                                .populate("section")
                                .exec(function (err, studentData) {
                                    console.log(studentData)
                                    if (err || !studentData) {
                                        return res.status(400).json({
                                            err: "Parent is Not Register",
                                        });
                                    } else {
                                        const {
                                            _id,
                                            firstname,
                                            lastname,
                                            email,
                                            phone,
                                            school,
                                            ParentbaseFields,
                                        } = parentData;
                                        return res.json({
                                            token,
                                            expiryTime: currentTime,
                                            user: {
                                                _id,
                                                firstname,
                                                lastname,
                                                user: "parent",
                                                permissions: ParentbaseFields,
                                                email,
                                                phone,
                                                school: school && school._id,
                                                schoolStatus: school && school.status,
                                                schoolStartExpire: school && school.startDate,
                                                schoolEndExpire: school && school.endDate,
                                                studentData
                                            },
                                        });
                                    }
                                });
                        }
                    }
                });
        } catch (error) {
            console.log(error);
        }
        break;
      default:
        return res.status(401).json({
            err: "Not Valid SID",
        });
        break;
    }
  } catch (error) { }
// });
};

exports.checkToken = (req, res, next, id) => {
    try {
        req.id = id;
        next();
    } catch (error) {
        console.log(error);
    }
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        massage: "SuperAdmin is Signout successfully",
    });
};

//authenticate Routes Controller
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    algorithms: ["HS256"],
    userProperty: "auth",
});

exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!checker) {
        return res.status(403).json({
            err: "Access Denied",
        });
    }
    console.log(checker)
    next();
};

exports.isSchoolAdminAuthenticated = (req, res, next) => {
    let checker =
        req.schooladmin && req.auth && req.schooladmin._id == req.auth._id;
    if (!checker) {
        return res.status(403).json({
            err: "Access Denied",
        });
    }
    next();
};

exports.isTokenAuthenticated = (req, res, next) => {
    if (req.id === req.auth._id) {
        if (req.auth.user === "schoolAdmin") {
            try {
                schoolAdmin.findById(req.id).exec((err, admin) => {
                    if (err || !admin) {
                        return res.status(400).json({
                            err: "No School Admin was found in Database",
                        });
                    }
                    req.schooladmin = admin;
                    next();
                });
            } catch (error) {
                console.log(error);
            }
        } else if (req.auth.user === "staff") {
            try {
                Staff.findById(req.id).exec((err, staff) => {
                    console.log(err)
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
        } else if (req.auth.user === "student") {
            try {
                Student.findById(req.id).exec((err, student) => {
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
        } else if (req.auth.user === "parent") {
            try {
                Student.findById(req.id).exec((err, parent) => {
                    if (err || !parent) {
                        return res.status(400).json({
                            err: "No Parent was found in Database",
                        });
                    }
                    req.parent = parent;
                    next();
                });
            } catch (error) {
                console.log(error);
            }
        }
    } else {
        return res.status(403).json({
            err: "Access Denied",
        });
    }
};

exports.isOwner = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            err: "Access Denied! Don't Have Permissions For That",
        });
    }
    next();
};
