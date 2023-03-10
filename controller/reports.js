const formidable = require("formidable");

//import require models
const Student = require("../model/student");
const Staff = require("../model/staff");
const Session = require("../model/session");
const staffAttandance = require("../model/staff_attandance");
const studentAttandance = require("../model/attendance");
const Events = require("../model/event");
const ExamSchema = require("../model/exam_master");
const AvailFees = require("../model/avail_fees");
const hostelRoomAllocation = require("../model/hostel_room_allocation");
const BudgetUsed = require("../model/budget_used_details");
const ExamSubjectSchema = require("../model/exam_subject_master");
const FeesMaster = require("../model/fees_management");
const FeesSubMaster = require("../model/fees_sub_management");
const FeesCollections = require("../model/student_fees_collection");
const StudentMarks = require("../model/student_marks");
const Class = require("../model/class");
const common = require("../config/common");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.studentReport = (req, res) => {
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
                    var params = {
                        school: ObjectId(req.params.schoolID),
                    };
                    if (fields.session){
                        params.session = ObjectId(fields.session);
                    }
                    if (fields.class){
                        params.class = ObjectId(fields.class);
                    }
                    if (fields.section){
                        params.section = ObjectId(fields.section);
                    }
                    Student.find(params)
                    .populate('class')
                    .populate('session')
                    .populate('section')
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting students. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting students. Please try again.",
                    });
                }
            }
        }
    });
};


exports.staffReport = (req, res) => {
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
                    var params = {
                        school: ObjectId(req.params.schoolID),
                    };
                    if (fields.session){
                        params.session = ObjectId(fields.session);
                    }
                    if (fields.assign_role){
                        params.assign_role = ObjectId(fields.assign_role);
                    }
                    if (fields.department){
                        params.department = ObjectId(fields.department);
                    }
                    Staff.find(params)
                    .populate('assign_role')
                    .populate('session')
                    .populate('department')
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting staff. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting staff. Please try again.",
                    });
                }
            }
        }
    });
};


exports.staffAttandance = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                session: 'required',
                month: 'required',
                year: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var session_data = await Session.findOne({_id: ObjectId(fields.session) });
                    if (session_data){
                        var working_days = session_data.working_days;
                        var date = new Date(fields.year + '-' + fields.month + '-1');
                        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                        var dates = common.daysDatesByStartEndDate(common.formatDate(firstDay),common.formatDate(lastDay),true);
    
                        var params = {
                            school: ObjectId(req.params.schoolID),
                            session: ObjectId(fields.session),
                            date: { $gte: common.formatDate(firstDay) + ' 00:00:00', $lte: common.formatDate(lastDay) + ' 23:59:59' }
                        };
                        if (fields.session){
                            params.session = ObjectId(fields.session);
                        }
                        // if (fields.assign_role){
                        //     params.assign_role = ObjectId(fields.assign_role);
                        // }
                        if (fields.department){
                            params.department = ObjectId(fields.department);
                        }
                        staffAttandance.find(params)
                        .populate({
                            path : 'staff',
                            populate : {
                                path : 'assign_role',
                                path : 'session',
                            }
                        })
                        .populate('department')
                        .sort({ min: 1 })
                            .then((result, err) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Problem in getting staff attandance. Please try again.",
                                    });
                                } else {
                                    if (result.length > 0){
                                        if (fields.assign_role){
                                            result = result.filter(res_ => {
                                                return res_ !== undefined && (res_.staff.assign_role._id.toString() == fields.assign_role);
                                            });
                                        }
                                    }
                                    // if (result.length > 0){
                                    //     if (fields.session){
                                    //         result = result.filter(res_ => {
                                    //             return res_ !== undefined && (res_.staff.session._id.toString() == fields.session);
                                    //         });
                                    //     }
                                    // }
                                    var output = {};
                                    var total_sundays = 0;
                                    var total_holidays = 0;

                                    var total_days = dates.length;
                                    dates.forEach(result_ => {
                                        var date = new Date(result_);
                                        var day = date.toString();
                                        if (day.substring(0, 3) === "Sun"){
                                            total_sundays++;
                                        }
                                        if ((day.substring(0, 3) === "Sat" && working_days == 5)) {
                                            total_holidays++;
                                        }
                                        result.forEach(r => {
                                            if (result_ == common.formatDate(r.date) || (day.substring(0, 3) === "Sat" && working_days == 5) || (day.substring(0, 3) === "Sun")){
                                                if (r.staff){
                                                    if ( ! output[r.staff._id]){
                                                        output[r.staff._id] = {
                                                            firstname: r.staff.firstname,
                                                            job: r.staff.job,
                                                            job_description: r.staff.job_description,
                                                            department: r.department,
                                                            lastname: r.staff.lastname,
                                                            full_day_present: 0,
                                                            half_day_present: 0,
                                                            total_absent: 0,
                                                            attandance: []
                                                        };
                                                    }
                                                    if ((day.substring(0, 3) === "Sat" && working_days == 5)) {
                                                        if ( ! containsObject({
                                                            _id: "",
                                                            date: result_,
                                                            attendance_status: 'H'
                                                        }, output[r.staff._id].attandance)){
                                                            output[r.staff._id].attandance.push({
                                                                _id: "",
                                                                date: result_,
                                                                attendance_status: 'H'
                                                            });
                                                        }
                                                    } else if ((day.substring(0, 3) === "Sun")){
                                                        if ( ! containsObject({
                                                            _id: "",
                                                            date: result_,
                                                            attendance_status: 'S'
                                                        }, output[r.staff._id].attandance)){
                                                            output[r.staff._id].attandance.push({
                                                                _id: "",
                                                                date: result_,
                                                                attendance_status: 'S'
                                                            });
                                                        }
                                                    } else {
                                                        if (r.attendance_status == 'L'){
                                                            output[r.staff._id].total_absent++;
                                                        } else if (r.attendance_status == 'P'){
                                                            output[r.staff._id].full_day_present++;
                                                        } else if (r.attendance_status == 'H'){
                                                            output[r.staff._id].half_day_present++;
                                                        }
                                                        output[r.staff._id].attandance.push({
                                                            _id: r._id,
                                                            date: result_,
                                                            attendance_status: r.attendance_status
                                                        });
                                                    }
                                                }
                                            }
                                        })
                                    })
                                    var keys = Object.keys(output);
                                    keys.forEach(r => {
                                        dates.forEach(result_ => {
                                            var avail = false;
                                            output[r].attandance.forEach(rr => {
                                                if (result_ == rr.date){
                                                    avail = true;
                                                }
                                            });
                                            if ( ! avail){
                                                output[r].attandance.push({
                                                    _id: "",
                                                    date: result_,
                                                    attendance_status: ""
                                                });
                                            }
                                        });
                                        output[r].attandance.sort((a, b) => { return new Date(a.date) - new Date(b.date) });
                                    });

                                    return res.status(200).json({
                                        output,
                                        total_sundays,
                                        total_holidays,
                                        total_days
                                    });
                                }
                            });
                    } else {
                        return res.status(400).json({
                            err: "Invalid session.",
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting staff attandance. Please try again.",
                    });
                }
            }
        }
    });
};


function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (JSON.stringify(list[i]) === JSON.stringify(obj)) {
            return true;
        }
    }

    return false;
}


exports.studentAttandance = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, file) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            var rules = {
                session: 'required',
                month: 'required',
                year: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var session_data = await Session.findOne({_id: ObjectId(fields.session) });
                    if (session_data){
                        var working_days = session_data.working_days;

                    var date = new Date(fields.year + '-' + fields.month + '-1');
                    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    var dates = common.daysDatesByStartEndDate(common.formatDate(firstDay),common.formatDate(lastDay));

                    var params = {
                        school: ObjectId(req.params.schoolID),
                        date: { $gte: common.formatDate(firstDay) + ' 00:00:00', $lte: common.formatDate(lastDay) + ' 23:59:59' }
                    };
                    if (fields.session){
                        params.session = ObjectId(fields.session);
                    }
                    if (fields.section){
                        params.section = ObjectId(fields.section);
                    }
                    if (fields.class){
                        params.class = ObjectId(fields.class);
                    }
                    studentAttandance.find(params)
                    .populate('session')
                    .populate('class')
                    .populate('student')
                    .populate('section')
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting student attandance. Please try again.",
                                });
                            } else {
                                var output = {};
                                var total_sundays = 0;
                                var total_holidays = 0;

                                var total_days = dates.length;
                                dates.forEach(result_ => {
                                    var date = new Date(result_);
                                    var day = date.toString();
                                    if (day.substring(0, 3) === "Sun"){
                                        total_sundays++;
                                    }
                                    if ((day.substring(0, 3) === "Sat" && working_days == 5)) {
                                        total_holidays++;
                                    }
                                    result.forEach(r => {
                                        if (result_ == common.formatDate(r.date) || (day.substring(0, 3) === "Sat" && working_days == 5) || (day.substring(0, 3) === "Sun")){
                                            if (r.student){
                                                if ( ! output[r.student._id]){
                                                    output[r.student._id] = {
                                                        firstname: r.student.firstname,
                                                        lastname: r.student.lastname,
                                                        class: r.class,
                                                        section: r.section,
                                                        full_day_present: 0,
                                                        half_day_present: 0,
                                                        total_absent: 0,
                                                        attandance: []
                                                    };
                                                }
                                                if ((day.substring(0, 3) === "Sat" && working_days == 5)) {
                                                    if ( ! containsObject({
                                                        _id: "",
                                                        date: result_,
                                                        attendance_status: 'H'
                                                    }, output[r.student._id].attandance)){
                                                        output[r.student._id].attandance.push({
                                                            _id: "",
                                                            date: result_,
                                                            attendance_status: 'H'
                                                        });
                                                    }
                                                } else if ((day.substring(0, 3) === "Sun")){
                                                    if ( ! containsObject({
                                                        _id: "",
                                                        date: result_,
                                                        attendance_status: 'S'
                                                    }, output[r.student._id].attandance)){
                                                        output[r.student._id].attandance.push({
                                                            _id: "",
                                                            date: result_,
                                                            attendance_status: 'S'
                                                        });
                                                    }
                                                } else {
                                                    if (r.attendance_status == 'L'){
                                                        output[r.student._id].total_absent++;
                                                    } else if (r.attendance_status == 'P'){
                                                        output[r.student._id].full_day_present++;
                                                    } else if (r.attendance_status == 'H'){
                                                        output[r.student._id].half_day_present++;
                                                    }
                                                    output[r.student._id].attandance.push({
                                                        _id: r._id,
                                                        date: result_,
                                                        attendance_status: r.attendance_status
                                                    });
                                                }
                                            }
                                        }
                                    })
                                });
                                var keys = Object.keys(output);
                                keys.forEach(r => {
                                    dates.forEach(result_ => {
                                        var avail = false;
                                        output[r].attandance.forEach(rr => {
                                            if (result_ == rr.date){
                                                avail = true;
                                            }
                                        });
                                        if ( ! avail){
                                            output[r].attandance.push({
                                                _id: "",
                                                date: result_,
                                                attendance_status: ""
                                            });
                                        }
                                    });
                                    output[r].attandance.sort((a, b) => { return new Date(a.date) - new Date(b.date) });

                                    // output[r].attandance = output[r].attandance.sort((a,b) => { return new Date(a.date) = new Date(b.date); });
                                });
                                return res.status(200).json({
                                    output,
                                    total_sundays,
                                    total_holidays,
                                    total_days
                                });
                            }
                        });
                    } else {
                        return res.status(400).json({
                            err: "Invalid session.",
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting student attandance. Please try again.",
                    });
                }
            }
        }
    });
};


exports.busReport = (req, res) => {
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
                    var params = {
                        school: ObjectId(req.params.schoolID),
                        type: 'transport',
                        is_deleted: 'N',
                    };
                    if (fields.session){
                        params.session = ObjectId(fields.session);
                    }
                    if (fields.section){
                        params.section = ObjectId(fields.section);
                    }
                    if (fields.class){
                        params.class = ObjectId(fields.class);
                    }
                    AvailFees.find(params)
                    .populate('student', '_id SID firstname lastname email phone')
                    .populate('session')
                    .populate('class', '_id name')
                    .populate('section', '_id name')
                    .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting bus report. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting bus report. Please try again.",
                    });
                }
            }
        }
    });
};


exports.hostelReport = (req, res) => {
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
                    var params = {
                        school: ObjectId(req.params.schoolID),
                    };
                    if (fields.session){
                        params.session = ObjectId(fields.session);
                    }
                    if (fields.section){
                        params.section = ObjectId(fields.section);
                    }
                    if (fields.class){
                        params.class = ObjectId(fields.class);
                    }
                    hostelRoomAllocation.find(params)
                    .populate('student', '_id SID firstname lastname email phone roll_number')
                    .populate('building')
                    .populate('session')
                    .populate('class', '_id name')
                    .populate('section', '_id name')
                    .populate('allocatedBy', '_id SID firstname lastname email phone')
                    .populate('vacantBy', '_id SID firstname lastname email phone')
                    .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting hostel report. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting hostel report. Please try again.",
                    });
                }
            }
        }
    });
};


exports.adminDashboard = (req, res) => {
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
                    var output = {};
                    var params = {
                        school: ObjectId(req.params.schoolID),
                    };
                    Student.countDocuments(params, function( err, count){
                        output.student_count = count;
                        Staff.countDocuments(params, function( err, count){
                            output.staff_count = count;
                            params.date = { $gte: common.formatDate(new Date()) + ' 00:00:00', $lte: common.formatDate(new Date()) + ' 23:59:59' };
                            params.attendance_status = 'L';
                            Staff.aggregate([
                                {
                                    $project: {
                                        _id: 1,
                                        firstname: 1,
                                        lastname: 1,
                                        SID: 1,
                                        email: 1,
                                        phone: 1,
                                        school: 1,
                                        date_of_birth: { $dateFromParts: { 'year': { $year: new Date() }, 'month' : { $month: '$date_of_birth' }, 'day': { $dayOfMonth: '$date_of_birth' } } },
                                    },
                                },
                                {
                                    $match: {
                                        $expr: {
                                            $eq: [{ $week: '$date_of_birth' }, { $week: new Date() }],
                                        },
                                        school: ObjectId(req.params.schoolID)
                                    }
                                }
                            ]).then(result => {
                                output.today_birthday = result;
                                Student.aggregate([
                                    {
                                        $project: {
                                            _id: 1,
                                            firstname: 1,
                                            lastname: 1,
                                            SID: 1,
                                            email: 1,
                                            phone: 1,
                                            date_of_birth: { $dateFromParts: { 'year': { $year: new Date() }, 'month' : { $month: '$birthDate' }, 'day': { $dayOfMonth: '$birthDate' } } },
                                        },
                                    },
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: [{ $week: '$date_of_birth' }, { $week: new Date() }],
                                            },
                                            school: ObjectId(req.params.schoolID)
                                        }
                                    }
                                ]).then(result => {
                                    output.today_birthday = [ ...output.today_birthday , ...result ];
                                    studentAttandance.find(params)
                                    .populate('student','_id firstname lastname phone email SID')
                                    .populate('session')
                                    .populate('class')
                                    .populate('section')
                                    .sort({ min: 1 })
                                    .then((result, err) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in getting student attandance. Please try again.",
                                            });
                                        } else {
                                            output.student_leave = result;
                                            staffAttandance.find(params)
                                            .populate('staff','_id firstname lastname SID email phone')
                                            .populate('department')
                                            .sort({ min: 1 })
                                            .then((result, err) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(400).json({
                                                        err: "Problem in getting staff attandance. Please try again.",
                                                    });
                                                } else {
                                                    output.staff_leave = result;
                                                    Events.find({
                                                        school: ObjectId(req.params.schoolID),
                                                        event_from: { $gte: common.formatDate(new Date()) + ' 00:00:00', $lte: common.formatDate(new Date()) + ' 23:59:59' }
                                                    })
                                                    .sort({ created_at: 1 })
                                                    .then((result, err) => {
                                                        output.notice_board = result;
                                                        res.status(200).json(output);
                                                    })
                                                }
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting dashboard details. Please try again.",
                    });
                }
            }
        }
    });
};



exports.staffDashboard = (req, res) => {
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
                    Session.find({ school: req.schooldoc._id })
                    .sort({ createdAt: -1 })
                    .then(async (session, err) => {
                        if (err || ! session) {
                            return res.status(400).json({
                                err: "Database Dont Have Admin",
                            });
                        }
                        var date = new Date();
                        var current_session = "";
                        session.map(async (data) => {
                            if (date >= new Date(data.start_date) && date <= data.end_date) {
                                current_session = data;
                            } else {
                                data["status"] = "closed";
                            }
                        });
                        var output = {};
                        var params = {
                            school: ObjectId(req.params.schoolID),
                        };
                        Student.countDocuments(params, function( err, count){
                            output.student_count = count;
                            Staff.countDocuments(params, function( err, count){
                                output.staff_count = count;
                                params.date = { $gte: common.formatDate(new Date()) + ' 00:00:00', $lte: common.formatDate(new Date()) + ' 23:59:59' };
                                params.attendance_status = 'L';
                                Staff.aggregate([
                                    {
                                        $project: {
                                            _id: 1,
                                            firstname: 1,
                                            lastname: 1,
                                            SID: 1,
                                            email: 1,
                                            phone: 1,
                                            school: 1,
                                            date_of_birth: { $dateFromParts: { 'year': { $year: new Date() }, 'month' : { $month: '$date_of_birth' }, 'day': { $dayOfMonth: '$date_of_birth' } } },
                                        },
                                    },
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: [{ $week: '$date_of_birth' }, { $week: new Date() }],
                                            },
                                            school: ObjectId(req.params.schoolID)
                                        }
                                    }
                                ]).then(result => {
                                    output.today_birthday = result;
                                    Student.aggregate([
                                        {
                                            $project: {
                                                _id: 1,
                                                firstname: 1,
                                                lastname: 1,
                                                SID: 1,
                                                email: 1,
                                                phone: 1,
                                                date_of_birth: { $dateFromParts: { 'year': { $year: new Date() }, 'month' : { $month: '$birthDate' }, 'day': { $dayOfMonth: '$birthDate' } } },
                                            },
                                        },
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: [{ $week: '$date_of_birth' }, { $week: new Date() }],
                                                },
                                                school: ObjectId(req.params.schoolID)
                                            }
                                        }
                                    ]).then(result => {
                                        output.today_birthday = [ ...output.today_birthday , ...result ];
                                        studentAttandance.find(params)
                                        .populate('student','_id firstname lastname phone email SID')
                                        .populate('session')
                                        .populate('class')
                                        .populate('section')
                                        .sort({ min: 1 })
                                        .then((result, err) => {
                                            if (err) {
                                                console.log(err);
                                                return res.status(400).json({
                                                    err: "Problem in getting student attandance. Please try again.",
                                                });
                                            } else {
                                                output.student_leave = result;
                                                staffAttandance.find(params)
                                                .populate('staff','_id firstname lastname SID email phone')
                                                .populate('department')
                                                .sort({ min: 1 })
                                                .then((result, err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(400).json({
                                                            err: "Problem in getting staff attandance. Please try again.",
                                                        });
                                                    } else {
                                                        output.staff_leave = result;
                                                        Events.find({
                                                            school: ObjectId(req.params.schoolID),
                                                            event_from: { $gte: common.formatDate(new Date()) + ' 00:00:00', $lte: common.formatDate(new Date()) + ' 23:59:59' }
                                                        })
                                                        .sort({ created_at: 1 })
                                                        .then((result, err) => {
                                                            output.notice_board = result;
                                                            var date = new Date();
                                                            var month = date.getMonth() + 1;
                                                            var year = date.getFullYear();
                                                            var last_date =  + year +'-' + month + '-' + getDays(year, month);
                                                            var first_date =  + year +'-' + month + '-01';
                                                            Events.find({
                                                                school: ObjectId(req.params.schoolID),
                                                                event_type: "bg-danger",
                                                                event_from: { $gte: first_date + ' 00:00:00', $lte: last_date + ' 23:59:59' }
                                                            })
                                                            .sort({ created_at: 1 })
                                                            .then((result, err) => {
                                                                output.holiday_list = result;
                                                                ExamSchema.find({
                                                                    school: ObjectId(req.params.schoolID),
                                                                    session: ObjectId(current_session._id),
                                                                    is_active: 'Y',
                                                                    is_deleted: 'N',
                                                                })
                                                                .populate('class')
                                                                .populate('section')
                                                                .sort({ created_at: 1 })
                                                                .then((result, err) => {
                                                                    output.exam_list = result;
                                                                    FeesCollections.find({
                                                                        school: ObjectId(req.params.schoolID),
                                                                        is_active: 'Y',
                                                                        is_deleted: 'N',
                                                                    }).then((fees_collection_result, err) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            return res.status(400).json({
                                                                                err: "Problem in getting class details. Please try again.",
                                                                            });
                                                                        } else {
                                                                            var revenue = 0;
                                                                            fees_collection_result.forEach(r => {
                                                                                if (r.paid == 'Y'){
                                                                                    revenue += parseFloat(r.total_amount);
                                                                                }
                                                                            })
                                                                            output.revenue = revenue;
                                                                            BudgetUsed.find({
                                                                                school: ObjectId(req.params.schoolID),
                                                                                session: ObjectId(current_session._id),
                                                                            })
                                                                            .sort({ created_at: 1 })
                                                                            .then((result, err) => {
                                                                                var budget_used = 0;
                                                                                result.forEach(r => {
                                                                                    budget_used += parseFloat(r.used_amount);
                                                                                });
                                                                                output.budget_used = budget_used;
                                                                                output.pending_fees = {
                                                                                    one_time_fees: 0,
                                                                                    tution_fees: 0,
                                                                                    transport_fees: 0,
                                                                                    hostel_fees: 0,
                                                                                };
                                                                                output.collected_fees = {
                                                                                    one_time_fees: 0,
                                                                                    tution_fees: 0,
                                                                                    transport_fees: 0,
                                                                                    hostel_fees: 0,
                                                                                };
                                                                                
                                                                                res.status(200).json(output);
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        })
                                                    }
                                                });
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });

                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting dashboard details. Please try again.",
                    });
                }
            }
        }
    });
};

const getDays = (year, month) => {
    return new Date(year, month, 0).getDate();
};

exports.summaryReport = (req, res) => {
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
                session: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var params = {
                        school: ObjectId(req.params.schoolID),
                        session: ObjectId(fields.session),
                    };
                    if (fields.section){
                        params.section = ObjectId(fields.section);
                    }
                    if (fields.class){
                        params._id = ObjectId(fields.class);
                    }
                    Class.find(params)
                    .sort({ createdAt: -1 })
                    .then((result, err) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({
                                err: "Problem in getting class details. Please try again.",
                            });
                        } else {
                            var final_data = [];
                            if (result.length > 0){
                                asyncLoop(result, function (item, next) { // It will be executed one by one
                                    FeesMaster.find({
                                        class: ObjectId(item._id),
                                        session: ObjectId(fields.session)
                                    })
                                    .then((fees_result, err) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in getting class details. Please try again.",
                                            });
                                        } else {
                                            if (fees_result.length > 0){
                                                var fees_ids = [];
                                                fees_result.forEach(r => {
                                                    fees_ids.push(ObjectId(r._id));
                                                });
                                                FeesSubMaster.find({
                                                    fees_management_id: {
                                                        $in: fees_ids
                                                    }
                                                }).then((fees_sub_result, err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(400).json({
                                                            err: "Problem in getting class details. Please try again.",
                                                        });
                                                    } else {
                                                        if (fees_sub_result.length > 0){
                                                            var total_fees = 0;
                                                            fees_sub_result.forEach(r => {
                                                                total_fees += parseFloat(r.total_amount);
                                                            });
                                                            FeesCollections.find({
                                                                fees_id: {
                                                                    $in: fees_ids,
                                                                },
                                                                is_active: 'Y',
                                                                is_deleted: 'N',
                                                            }).then((fees_collection_result, err) => {
                                                                if (err) {
                                                                    console.log(err);
                                                                    return res.status(400).json({
                                                                        err: "Problem in getting class details. Please try again.",
                                                                    });
                                                                } else {
                                                                    console.log('3');
                                                                    var fee_due = 0;
                                                                    var fee_received = 0;
                                                                    var total = 0;
                                                                    if (fees_collection_result.length > 0){
                                                                        fees_collection_result.forEach(r => {
                                                                            total += parseFloat(r.total_amount);
                                                                            if (r.paid == 'Y'){
                                                                                fee_received += parseFloat(r.total_amount);
                                                                            } else {
                                                                                fee_due += parseFloat(r.total_amount);
                                                                            }
                                                                        });
                                                                    }
                                                                    final_data.push({
                                                                        fee_due,
                                                                        fee_received,
                                                                        total,
                                                                        total_fees,
                                                                        ...item.toObject()
                                                                    });
                                                                    next();
                                                                }
                                                            });
                                                        } else {
                                                            next();
                                                        }
                                                    }
                                                });
                                            } else {
                                                next();
                                            }
                                        }
                                    });
                                }, function (err) {
                                    return res.status(200).json(final_data);
                                });
                            } else {
                                return res.status(400).json({
                                    err: "No class is available",
                                });
                            }
                        }
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting hostel report. Please try again.",
                    });
                }
            }
        }
    });
};


