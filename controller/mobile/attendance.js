//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const asyncLoop = require('node-async-loop');
const common = require("../../config/common");
//import require models
const Attendance = require("../../model/attendance");
const Student = require("../../model/student");
const STAFF = require("../../model/staff");
const SECTION = require("../../model/section");

//exports routes controller

exports.createAttendance = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        }
        try {
            var attendance = JSON.parse(fields.attendance);
            Attendance.insertMany(attendance, (err, attendances) => {
                if (err || !attendances) {
                    return res.status(400).json({
                        err: "Can't Able to save attendances right!",
                    });
                } else {
                    return res.json(attendances);
                }
            });
        } catch (error) {
            console.log("Create Attendance", error);
        }
    });
};

exports.getAttendance = (req, res) => {
    Attendance.findOne({ _id: req.attendance._id })
        .populate("class")
        .populate("school")
        .populate("section")
        .populate("session")
        .populate("student")
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
            .populate("school")
            .populate("section")
            .populate("session")
            .populate("student")
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
    try {
        Attendance.find({
            class: classs,
            section: sections,
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
                        new Date(attendance_data.date) >= new Date(start_date) &&
                        new Date(attendance_data.date) <= new Date(end_date)
                    ) {
                        data.push(attendance_data);
                    }
                });
                if (req.body.studentID) {
                    var mainObj = {
                        workingDay: [],
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
                        mainObj[
                            data.student.firstname +
                            data.student.lastname +
                            " " +
                            data.student.SID
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
                        mainObj[
                            data.student.firstname +
                            data.student.lastname +
                            " " +
                            data.student.SID
                        ].push(data.attendance_status);
                    });
                    if (req.id == classTeacher) {
                        mainObj["classTeacher"] = true;
                    } else {
                        mainObj["classTeacher"] = false;
                    }
                    return res.json(mainObj);
                } else {
                    var mainObj = {
                        workingDay: [],
                    };
                    var classTeacher = "";
                    data.map(async (data) => {
                        mainObj[
                            data.student.firstname +
                            data.student.lastname +
                            " " +
                            data.student.SID
                        ] = [];
                        classTeacher = data.section.classTeacher;
                    });
                    data.map(async (data) => {
                        var newDate = data.date.toString();
                        console.log(newDate);
                        mainObj.workingDay.push(
                            newDate.slice(8, 10) + "-" + newDate.slice(4, 7)
                        );
                    });
                    const unique = [...new Set(mainObj.workingDay)];
                    mainObj.workingDay = unique;
                    await data.map(async (data) => {
                        mainObj[
                            data.student.firstname +
                            data.student.lastname +
                            " " +
                            data.student.SID
                        ].push(data.attendance_status);
                    });
                    if (req.id == classTeacher) {
                        mainObj["classTeacher"] = true;
                    } else {
                        mainObj["classTeacher"] = false;
                    }
                    return res.json(mainObj);
                }
            });
    } catch (error) {
        console.log("getAllAttendance", error);
    }
};


exports.updateStudentAttendance = async (req, res) => {
    var data = { ...req.body };
    var rules = {
        session: 'required',
        attandance_data: 'required',
        from_date: 'required',
        to_date: 'required',
    }
    if (common.checkValidationRulesJson(data, res, rules, 'M')) {
        try {
            var error = true;
            data.attandance_data.forEach(result => {
                if (!result.attendance_status && error) {
                    return common.sendJSONResponse(res, 0, "Attandance status is required.", null);
                } else if (!result.date && error) {
                    return common.sendJSONResponse(res, 0, "Date is required.", null);
                } else if (!result.student && error) {
                    return common.sendJSONResponse(res, 0, "Student id is required.", null);
                }
            });
            if (error) {
                STAFF.findById(req.params.id).then(async (result, err) => {
                    if (err || !result) {
                        if (err) {
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Staff details are not available", null);
                    } else {
                        if (result.isClassTeacher) {
                            SECTION.findOne({ classTeacher: ObjectId(req.params.id) }).then(async (result, err) => {
                                if (err || !result) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    return common.sendJSONResponse(res, 0, "Class details not available", null);
                                } else {
                                    data.class = result.class;
                                    data.section = result._id;
                                    if (data.from_date == data.to_date){
                                        var dates = [data.from_date];
                                    } else {
                                        var dates = common.daysDatesByStartEndDate((data.from_date), (data.to_date), false);
                                    }
                                    var students = await Student.find({ class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID) });
                                    var attandance = await Attendance.find({ class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID), date: { $gte: data.from_date + ' 00:00:00', $lte: data.to_date + ' 23:59:59' } });
                                    var newParam = [];
                                    dates.forEach(date => {
                                        students.forEach(student => {
                                            var avail = false;
                                            attandance.forEach(att => {
                                                var att_date = common.formatDate(new Date(att.date));
                                                if (att_date == date && student._id.toString() == att.student.toString()) {
                                                    avail = true;
                                                }
                                            });
                                            if (!avail) {
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
                                            return common.sendJSONResponse(res, 0, "Problem in updating attandance. Please try again.", null);
                                        } else {
                                            asyncLoop(data.attandance_data, async function (item, next) { // It will be executed one by one
                                                await Attendance.findOneAndUpdate(
                                                    { student: item.student, date: { $gte: item.date + ' 00:00:00', $lte: item.date + ' 23:59:59' } },
                                                    { $set: { attendance_status: item.attendance_status } },
                                                    { new: true, useFindAndModify: false },
                                                );
                                                next();
                                            }, function (err) {
                                                return common.sendJSONResponse(res, 1, "Attandance updated successfully.", true);
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            return common.sendJSONResponse(res, 0, "You can't update attandance as you are not a class teacher", null);
                        }
                    }
                });

            }
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in updating attandance. Please try again.", null);
        }
    }
};

exports.getStudentAttandance = async (req, res) => {
    var data = { ...req.body };
    var rules = {
        session: 'required',
        from_date: 'required',
        to_date: 'required',
    }
    if (common.checkValidationRulesJson(data, res, rules, 'M')) {
        try {
            STAFF.findById(req.params.id).then(async (result, err) => {
                if (err || !result) {
                    if (err) {
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "Staff details are not available", null);
                } else {
                    if (result.isClassTeacher) {
                        SECTION.findOne({ classTeacher: ObjectId(req.params.id) }).then(async (result, err) => {
                            if (err || !result) {
                                if (err) {
                                    console.log(err);
                                }
                                return common.sendJSONResponse(res, 0, "Class details not available", null);
                            } else {
                                data.class = result.class;
                                data.section = result._id;
                                var params = {
                                    class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID)
                                }
                                if (data.name) {
                                    params.firstname = { $regex: data.name, $options: "i" }
                                    params.lastname = { $regex: data.name, $options: "i" }
                                }
                                if (data.student_id) {
                                    params.SID = { $regex: data.student_id, $options: "i" }
                                }
                                var students = await Student.find(params).select('_id firstname lastname SID email phone').exec();
                                if (students.length > 0) {
                                    var params = { class: ObjectId(data.class), section: ObjectId(data.section), school: ObjectId(req.params.schoolID), date: { $gte: data.from_date + ' 00:00:00', $lte: data.to_date + ' 23:59:59' } };
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
                                            if (att.student.toString() == result._id.toString()) {
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
                                    return common.sendJSONResponse(res, 1, "Attandance fetched successfully.", output);
                                } else {
                                    return common.sendJSONResponse(res, 2, "No data available", students);
                                }
                            }
                        });
                    } else {
                        return common.sendJSONResponse(res, 0, "You can't view attandance as you are not a class teacher", null);
                    }
                }
            });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in getting attandance. Please try again.", null);
        }
    }
};


exports.monthWiseAttandance = async (req, res) => {
    var data = { ...req.body };
    var rules = {
        session: 'required',
        student_id: 'required',
        month: 'required',
    }
    if (common.checkValidationRulesJson(data, res, rules, 'M')) {
        try {
            const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
            var date = new Date(), y = date.getFullYear(), m = month.indexOf(data.month);
            var firstDay = new Date(y, m, 1);
            var lastDay = new Date(y, m + 1, 0);
            var from_date = common.formatDate(firstDay);
            var to_date = common.formatDate(lastDay);
            var attandance = await Attendance.find({ session: ObjectId(data.session), student: ObjectId(data.student_id), school: ObjectId(req.params.schoolID), date: { $gte: from_date + ' 00:00:00', $lte: to_date + ' 23:59:59' } });
            if (attandance.length > 0){
                return common.sendJSONResponse(res, 1, "Student attandance fetched successfully.", attandance);
            } else {
                return common.sendJSONResponse(res, 2, "Student attandance data not available.", []);
            }
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in getting attandance. Please try again.", null);
        }
    }
};


exports.sessionWiseAttandance = async (req, res) => {
    var data = { ...req.body };
    var rules = {
        session: 'required',
        student_id: 'required',
    }
    if (common.checkValidationRulesJson(data, res, rules, 'M')) {
        try {
            var attandance = await Attendance.find({
                session: ObjectId(data.session), student: ObjectId(data.student_id), school: ObjectId(req.params.schoolID)
            }).select('_id attendance_status').exec();
            var output = {
                present: 0,
                absent: 0,
                leave: 0,
                half_day: 0,
            }
            attandance.forEach(result => {
                if (result.attendance_status == 'P'){
                    output.present++;
                } else if (result.attendance_status == 'A'){
                    output.absent++;
                } else if (result.attendance_status == 'L'){
                    output.leave++;
                } else if (result.attendance_status == 'H'){
                    output.half_day++;
                }
            })
            return common.sendJSONResponse(res, 1, "Attandance fetched successfully.", output);
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in getting attandance. Please try again.", null);
        }
    }
};

