//import all require dependencies
const formidable = require("formidable");
const { toLower } = require("lodash");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const asyncLoop = require('node-async-loop');
const common = require("../config/common");

//import require models
const Attendance = require("../model/attendance");
const Student = require("../model/student");

//exports routes controller
exports.getAttendanceByID = (req, res, next, id) => {
    try {
        Attendance.findById(id).exec((err, attendance) => {
            if (err || !attendance) {
                return res.status(400).json({
                    err: "No Attendance was found in Database",
                });
            }
            req.attendance = attendance;
            next();
        });
    } catch (error) {
        console.log("getAttendanceByID", error);
    }
};

exports.createAttendance = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        }
        try {
            var attendance = JSON.parse(fields.attendance);
            Attendance.find({
                student: attendance[0].student,
                date: attendance[0].date,
            }).then(async (attendance_one, err) => {
                if (attendance_one.length > 0) {
                    return res.status(400).json({
                        err: "Attendance Can't Be Repeat Please Check Your Data!",
                    });
                } else {
                    Attendance.insertMany(attendance, (err, attendances) => {
                        if (err || !attendances) {
                            return res.status(400).json({
                                err: "Can't Able to save attendances right!",
                            });
                        } else {
                            return res.json(attendances);
                        }
                    });
                }
            });
        } catch (error) {
            console.log("Create Attendance", error);
        }
    });
};


exports.updateStudentAttendance = async (req, res) => {
    var data = { ...req.body };
    var rules = {
        session: 'required',
        class: 'required',
        section: 'required',
        attandance_data: 'required',
        from_date: 'required',
        to_date: 'required',
    }
    if (common.checkValidationRulesJson(data, res, rules)) {
        try {
            var error = true;
            data.attandance_data.forEach(result => {
                if (!result.attendance_status && error){
                    return res.status(400).json({
                        err: "Attandance status is required",
                    });
                } else if (!result.date && error){
                    return res.status(400).json({
                        err: "Date is required",
                    });
                } else if (!result.student && error){
                    return res.status(400).json({
                        err: "Student id is required",
                    });
                }
            });
            if (error){
                var dates = common.daysDatesByStartEndDate((data.from_date), (data.to_date), false);
                var students = await Student.find({ class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID) });
                var attandance = await Attendance.find({class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID), date: { $gte: data.from_date + ' 00:00:00', $lte: data.to_date + ' 23:59:59' }});
                var newParam = [];
                dates.forEach(date => {
                    students.forEach(student => {
                        var avail = false;
                        attandance.forEach(att => {
                            var att_date = common.formatDate(new Date(att.date));
                            if (att_date == date && student._id.toString() == att.student.toString()){
                                avail = true;
                            }
                        });
                        if ( ! avail){
                            newParam.push({
                                'attendance_status': 'P',
                                'date': date,
                                'session': data.session,
                                'class': data.class,
                                'section': data.section,
                                'school': req.params.schoolID,
                                'student': student
                            });
                        }
                    })
                })
                Attendance.insertMany(newParam, function (error, result) {
                    if (error) {
                        console.log(error)
                        return res.status(400).json({
                            err: "Problem in updating attandance. Please try again.",
                        });
                    } else {
                        asyncLoop(data.attandance_data, async function (item, next) { // It will be executed one by one
                            await Attendance.findOneAndUpdate(
                                { student: item.student, date: { $gte: item.date + ' 00:00:00', $lte: item.date + ' 23:59:59' } },
                                { $set: { attendance_status: item.attendance_status } },
                                { new: true, useFindAndModify: false },
                            );
                            next();
                        }, function (err) {
                            return res.status(200).json({status: true});
                        });
                    }
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                err: "Problem in updating attandance. Please try again.",
            });
        }
    }
};

exports.getStudentAttandance = async (req, res) => {
    var data = { ...req.body };
    var rules = {
        session: 'required',
        class: 'required',
        section: 'required',
        from_date: 'required',
        to_date: 'required',
    }
    if (common.checkValidationRulesJson(data, res, rules)) {
        try {
            var params = {
                class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID)
            }
            if (data.name){
                params.firstname = { $regex: data.name, $options: "i" }
                params.lastname = { $regex: data.name, $options: "i" }
            }
            if (data.student_id){
                params.SID = { $regex: data.student_id, $options: "i" }
            }
            var students = await Student.find(params).select('_id firstname lastname SID email phone').exec();
            if (students.length > 0){
                var params = {class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID), date: { $gte: data.from_date + ' 00:00:00', $lte: data.to_date + ' 23:59:59' }};
                var student_ids = [];
                students.forEach(result => {
                    student_ids.push(ObjectId(result._id));
                })
                params.student = { "$in": student_ids };
                var attandance = await Attendance.find(params).select('_id attendance_status date student').exec();
                var output = [];
                students.forEach((result) => {
                    var attandances = [];
                    attandance.forEach(att => {
                        if (att.student.toString() == result._id.toString()){
                            attandances.push(att);
                        }
                    });
                    output.push({
                        _id: result._id,
                        firstname: result.firstname,
                        lastname: result.lastname,
                        SID: result.SID,
                        email: result.email,
                        phone: result.phone,
                        attandance: attandances
                    });
                });
                return res.status(200).json(output);
            } else {
                return res.status(200).json(students);
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                err: "Problem in getting attandance. Please try again.",
            });
        }
    }
};


exports.getAttendance = (req, res) => {
    return res.json(req.attendance);
};

exports.updateAttendance = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        try {
            let attendance = req.attendance;
            attendance = _.extend(attendance, fields);
            attendance.save((err, attendance) => {
                if (err) {
                    return res.status(400).json({
                        err: "Update attendance in Database is Failed",
                    });
                }
                res.json(attendance);
            });
        } catch (error) {
            console.log("updateAttendance", error);
        }
    });
};

exports.getAllAttendance = (req, res) => {
    try {
        Attendance.find({ school: req.schooldoc._id })
            .populate("class")
            .populate("section")
            .populate("session")
            .sort({ createdAt: -1 })
            .then((attendance, err) => {
                if (err || !attendance) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                return res.json(attendance);
            });
    } catch (error) {
        console.log("getAllAttendance", error);
    }
};

exports.getAllAttendanceByFilter = (req, res) => {
    let classs = req.body.class;
    let sections = req.body.section;
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;
    let session = req.body.session;
    let today = req.body.today_date;
    try {
        if (req.body.studentID) {
            Attendance.find({
                session: session,
                school: req.schooldoc._id,
            })
                .populate("student")
                .populate("section")
                .sort({ createdAt: 1 })
                .then(async (attendance, err) => {
                    if (err || !attendance) {
                        return res.status(400).json({
                            err: "Database Dont Have Admin",
                        });
                    }
                    var data = [];
                    await attendance.map(async (attendance_data) => {
                        if (
                            new Date(attendance_data.date).valueOf() >=
                            new Date(start_date).valueOf() &&
                            new Date(attendance_data.date).valueOf() <=
                            new Date(end_date).valueOf()
                        ) {
                            data.push(attendance_data);
                        }
                    });

                    var mainObj = {
                        workingDay: [],
                        studentDatas: {},
                    };
                    var studentData = [];
                    var classTeacher = "";
                    data.map(async (data) => {
                        if (data.student.SID === req.body.studentID) {
                            studentData.push(data);
                            classTeacher = data.section.classTeacher;
                        }
                    });
                    studentData.map(async (data) => {
                        mainObj.studentDatas[
                            data.student.firstname +
                            " " +
                            data.student.lastname +
                            "," +
                            data.student.SID +
                            "," +
                            data.student._id
                        ] = [];
                    });
                    studentData.map(async (data) => {
                        var newDate = data.date.toString();
                        mainObj.workingDay.push(
                            newDate.slice(8, 10) + "-" + newDate.slice(4, 7)
                        );
                    });
                    const unique = [...new Set(mainObj.workingDay)];
                    mainObj.workingDay = unique;
                    await studentData.map(async (data) => {
                        mainObj.studentDatas[
                            data.student.firstname +
                            " " +
                            data.student.lastname +
                            "," +
                            data.student.SID +
                            "," +
                            data.student._id
                        ].push(data.attendance_status);
                    });
                    if (req.id == classTeacher) {
                        mainObj["classTeacher"] = true;
                        mainObj["Today"] = false;
                    } else {
                        mainObj["classTeacher"] = false;
                        mainObj["Today"] = false;
                    }
                    await data.map(async (data) => {
                        if (
                            mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                            ].length < mainObj.workingDay.length
                        ) {
                            let tempData =
                                mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                                ];
                            let diff = mainObj.workingDay.length - tempData.length;
                            for (let i = 0; i < diff; i++) {
                                tempData.unshift("N");
                            }
                            mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                            ] = tempData;
                        }
                    });
                    return res.json(mainObj);
                });
        } else if (req.body.name) {
            Attendance.find({
                session: session,
                school: req.schooldoc._id,
            })
                .populate("student")
                .populate("section")
                .sort({ createdAt: 1 })
                .then(async (attendance, err) => {
                    if (err || !attendance) {
                        return res.status(400).json({
                            err: "Database Dont Have Admin",
                        });
                    }
                    var data = [];
                    await attendance.map(async (attendance_data) => {
                        if (
                            new Date(attendance_data.date).valueOf() >=
                            new Date(start_date).valueOf() &&
                            new Date(attendance_data.date).valueOf() <=
                            new Date(end_date).valueOf()
                        ) {
                            data.push(attendance_data);
                        }
                    });

                    var mainObj = {
                        workingDay: [],
                        studentDatas: {},
                    };
                    var studentData = [];
                    var classTeacher = "";
                    var name = req.body.name;
                    var mainName = name.replace(/\s+/g, "");
                    data.map(async (data) => {
                        if (
                            toLower(data.student.firstname + data.student.lastname) ===
                            toLower(mainName)
                        ) {
                            studentData.push(data);
                            classTeacher = data.section.classTeacher;
                        }
                    });
                    studentData.map(async (data) => {
                        mainObj.studentDatas[
                            data.student.firstname +
                            " " +
                            data.student.lastname +
                            "," +
                            data.student.SID +
                            "," +
                            data.student._id
                        ] = [];
                    });
                    studentData.map(async (data) => {
                        var newDate = data.date.toString();
                        mainObj.workingDay.push(
                            newDate.slice(8, 10) + "-" + newDate.slice(4, 7)
                        );
                    });
                    const unique = [...new Set(mainObj.workingDay)];
                    mainObj.workingDay = unique;
                    await studentData.map(async (data) => {
                        mainObj.studentDatas[
                            data.student.firstname +
                            " " +
                            data.student.lastname +
                            "," +
                            data.student.SID +
                            "," +
                            data.student._id
                        ].push(data.attendance_status);
                    });
                    if (req.id == classTeacher) {
                        mainObj["classTeacher"] = true;
                        mainObj["Today"] = false;
                    } else {
                        mainObj["classTeacher"] = false;
                        mainObj["Today"] = false;
                    }
                    await data.map(async (data) => {
                        if (
                            mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                            ].length < mainObj.workingDay.length
                        ) {
                            let tempData =
                                mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                                ];
                            let diff = mainObj.workingDay.length - tempData.length;
                            for (let i = 0; i < diff; i++) {
                                tempData.unshift("N");
                            }
                            mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                            ] = tempData;
                        }
                    });
                    return res.json(mainObj);
                });
        } else {
            Attendance.find({
                class: classs,
                section: sections,
                session: session,
                school: req.schooldoc._id,
            })
                .populate("student")
                .populate("section")
                .sort({ createdAt: 1 })
                .then(async (attendance, err) => {
                    if (err || !attendance) {
                        return res.status(400).json({
                            err: "Database Dont Have Admin",
                        });
                    }
                    var data = [];
                    var checker = false;
                    await attendance.map(async (attendance_data) => {
                        if (
                            new Date(attendance_data.date).valueOf() >=
                            new Date(start_date).valueOf() &&
                            new Date(attendance_data.date).valueOf() <=
                            new Date(end_date).valueOf()
                        ) {
                            data.push(attendance_data);
                        }
                    });
                    await attendance.map(async (attendance_data) => {
                        if (
                            new Date(today).valueOf() ==
                            new Date(attendance_data.date).valueOf()
                        ) {
                            checker = true;
                        }
                    });
                    var mainObj = {
                        workingDay: [],
                        studentDatas: {},
                    };
                    var classTeacher = "";
                    data.map(async (data) => {
                        mainObj.studentDatas[
                            data.student.firstname +
                            " " +
                            data.student.lastname +
                            "," +
                            data.student.SID +
                            "," +
                            data.student._id
                        ] = [];
                        classTeacher = data.section.classTeacher;
                    });
                    data.map(async (data) => {
                        var newDate = data.date.toString();
                        mainObj.workingDay.push(
                            newDate.slice(8, 10) + "-" + newDate.slice(4, 7)
                        );
                    });
                    const unique = [...new Set(mainObj.workingDay)];
                    mainObj.workingDay = unique;
                    await data.map(async (data) => {
                        mainObj.studentDatas[
                            data.student.firstname +
                            " " +
                            data.student.lastname +
                            "," +
                            data.student.SID +
                            "," +
                            data.student._id
                        ].push(data.attendance_status);
                    });
                    if (req.id == classTeacher) {
                        mainObj["classTeacher"] = true;
                    } else {
                        mainObj["classTeacher"] = false;
                    }
                    if (checker === false) {
                        mainObj["Today"] = false;
                    } else {
                        mainObj["Today"] = true;
                    }
                    await data.map(async (data) => {
                        if (
                            mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                            ].length < mainObj.workingDay.length
                        ) {
                            let tempData =
                                mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                                ];
                            let diff = mainObj.workingDay.length - tempData.length;
                            for (let i = 0; i < diff; i++) {
                                tempData.unshift("N");
                            }
                            mainObj.studentDatas[
                                data.student.firstname +
                                " " +
                                data.student.lastname +
                                "," +
                                data.student.SID +
                                "," +
                                data.student._id
                            ] = tempData;
                        }
                    });
                    return res.json(mainObj);
                });
        }
    } catch (error) {
        console.log("getAllAttendance", error);
    }
};

exports.editAttendanceForDate = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        try {
            if (fields.ID) {
                let editAttedance = JSON.parse(fields.editAttedance);
                var check = false;
                await editAttedance.map(async (data) => {
                    await Attendance.updateOne(
                        {
                            school: req.schooldoc._id,
                            date: fields.date,
                            student: data.id,
                        },
                        {
                            $set: {
                                attendance_status: data.attendance_status,
                            },
                        },
                        (err, newData) => {
                            if (err) {
                                check = true;
                            }
                        }
                    );
                });
                if (check === true) {
                    return res.status(400).json({
                        err: "Can't Able To Update All Entrys Please Check Again",
                    });
                } else {
                    return res.status(200).json({
                        status: "Update Attendance is Done!",
                    });
                }
            } else {
                let editAttedance = JSON.parse(fields.editAttedance);
                var check = false;
                await editAttedance.map(async (data) => {
                    await Attendance.updateOne(
                        {
                            school: req.schooldoc._id,
                            date: fields.date,
                            class: fields.class,
                            section: fields.section,
                            student: data.id,
                        },
                        {
                            $set: {
                                attendance_status: data.attendance_status,
                            },
                        },
                        (err, newData) => {
                            if (err) {
                                check = true;
                            }
                        }
                    );
                });
                if (check === true) {
                    return res.status(400).json({
                        err: "Can't Able To Update All Entrys Please Check Again",
                    });
                } else {
                    return res.status(200).json({
                        status: "Update Attendance is Done!",
                    });
                }
            }
        } catch (error) {
            console.log("updateAttendanceForDate", error);
        }
    });
};

exports.deleteAttendance = (req, res) => {
    let attendance = req.attendance;
    try {
        attendance.remove((err, attendance) => {
            if (err || !attendance) {
                return res.status(400).json({
                    err: "Can't Able To Delete attendance",
                });
            }
            return res.json({
                Massage: `attendance is Deleted SuccessFully`,
            });
        });
    } catch (error) {
        console.log("deleteAttendance", error);
    }
};
