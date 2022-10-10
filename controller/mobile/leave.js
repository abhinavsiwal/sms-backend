const Leave = require("../../model/leave");
const Staff = require("../../model/staff");
const Attendance = require("../../model/attendance");
const Student = require("../../model/student");
const common = require("../../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Session = require("../../model/session");
const StaffAttendance = require("../../model/staffAttendance");

exports.createLeave = async (req, res) => {
    var fields = req.body;
    var rules = {
        dateFrom: 'required',
        dateTo: 'required',
        reason: 'required',
        type_from: 'required|in:half,full',
        type_to: 'required|in:half,full',
        school: 'required',
        session: 'required',
    }
    if (fields.student){
        rules.student = 'required';
        rules.class = 'required';
        rules.section = 'required';
    } else {
        rules.staff = 'required';
        rules.leaveType = 'required|in:EL,LOP,COMPOFF';
        rules.department = 'required';
    }
    if (common.checkValidationRulesJson(fields, res, rules, 'M')) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(fields.dateTo);
        const secondDate = new Date(fields.dateFrom);
        const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
        var noOfDays = diffDays + 1;
        if (noOfDays == 1){
            if (fields.type_from != fields.type_to){
                return common.sendJSONResponse(res, 0, "Leave type must be same for one day leave", null);
            } else if (fields.type_from == 'half'){
                noOfDays = noOfDays - 0.5;
            }
        } else {
            if (fields.type_from == 'half'){
                noOfDays = noOfDays - 0.5;
            }
            if (fields.type_to == 'half'){
                noOfDays = noOfDays - 0.5;
            }
        }
        if (fields.student){
            var student = await Student.find({ _id: ObjectId(fields.student), school: ObjectId(fields.school) });
            if ( ! student){
                return common.sendJSONResponse(res, 0, "Student Not Found", null);
            }
            if (fields.type_from == 'half' || fields.type_to == 'half'){
                return common.sendJSONResponse(res, 0, "You can't apply for half day leave", null);
            }
            var leaveDetails = new Leave({
                leaveType: 'LOP',
                dateFrom: fields.dateFrom,
                dateTo: fields.dateTo,
                noOfDays: noOfDays,
                reason: fields.reason,
                status: 'Awaiting',
                student: fields.student,
                class: fields.class,
                section: fields.section,
                type_from: fields.type_from,
                type_to: fields.type_to,
                school: fields.school,
                session: fields.session,
                is_active: 'Y',
                is_deleted: 'N'
            });
            leaveDetails.save(function(err,result){
                if (err){
                    console.log(err);
                    return common.sendJSONResponse(res, 0, "Problem in applying leave. Please try again.", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Leave applied successfully", result);
                }
            });
        } else {
            var staff = await Staff.find({ _id: ObjectId(fields.staff), department: ObjectId(fields.department), school: ObjectId(fields.school) });
            if ( ! staff){
                return common.sendJSONResponse(res, 0, "Staff Not Found", null);
            } else {
                var session_details = await Session.findOne({ _id: ObjectId(fields.session), school: ObjectId(fields.school) });
                if ( ! session_details){
                    return common.sendJSONResponse(res, 0, "Session Not Found", null);
                } else {
                    if (fields.leaveType == 'EL'){
                        var totalEarnedLeaves = 0;
                        if (session_details.earned_leaves){
                            totalEarnedLeaves = session_details.earned_leaves;
                        }
                        var applied_leaves = 0;
                        var leave_data = await Leave.find({staff: ObjectId(fields.staff), leaveType: 'EL', session: ObjectId(fields.session)});
                        if (leave_data && leave_data.length > 0){
                            leave_data.forEach(r => {
                                applied_leaves += parseFloat(r.noOfDays);
                            });
                        }
                        if (totalEarnedLeaves <= applied_leaves){
                            return common.sendJSONResponse(res, 0, "You are not eligible to apply earned leaves", null);
                        }
                    }
                    var leaveDetails = new Leave({
                        leaveType: fields.leaveType,
                        dateFrom: fields.dateFrom,
                        dateTo: fields.dateTo,
                        noOfDays: noOfDays,
                        reason: fields.reason,
                        status: 'Awaiting',
                        staff: fields.staff,
                        department: fields.department,
                        type_from: fields.type_from,
                        type_to: fields.type_to,
                        school: fields.school,
                        session: fields.session,
                        is_active: 'Y',
                        is_deleted: 'N'
                    });
                    leaveDetails.save(function(err,result){
                        if (err){
                            console.log(err);
                            return common.sendJSONResponse(res, 0, "Problem in applying leave. Please try again.", null);
                        } else {
                            return common.sendJSONResponse(res, 1, "Leave applied successfully", result);
                        }
                    });
                }

            }
        }
    }
};


exports.update_leave_status = async (req, res) => {
    var fields = req.body;
    var rules = {
        leave_id: 'required',
        status: 'required|in:Approved,Declined,Cancelled',
        school: 'required',
    }
    if (common.checkValidationRulesJson(fields, res, rules, 'M')) {
        var leave_data = await Leave.findOne({_id: ObjectId(fields.leave_id), school: ObjectId(fields.school), is_deleted: 'N' });
        if ( ! leave_data){
            return common.sendJSONResponse(res, 0, "Leave details not found.", null);
        }
        if (leave_data.status == 'Cancelled'){
            return common.sendJSONResponse(res, 0, "You can't update the cancelled leave.", null);
        }
        if (leave_data.student){
            var leave;
            if (fields.status == "Approved") {
                let date = leave_data.dateFrom;
                var params = [];
                for (let i = 0; i < leave_data.noOfDays; i++) {
                    if (i == 0){
                        var new_date = new Date(date);
                    } else {
                        var new_date = new Date(date.setDate(date.getDate() + 1));
                    }
                    params.push({
                        date: common.formatDate(new_date),
                        attendance_status: "L",
                        class: leave_data.class,
                        section: leave_data.section,
                        school: leave_data.school,
                        student: leave_data.student,
                        session: leave_data.session,
                    });
                }
                Attendance.insertMany(params, async function (error, result) {
                    if (error) {
                        console.log(error)
                        return common.sendJSONResponse(res, 0, "Problem in approving leave. Please try again.", null);
                    } else {
                        leave = await Leave.findOneAndUpdate(
                            { _id: fields.leave_id },
                            { $set: { status: fields.status, updated_by: req.params.id } },
                            { new: true, useFindAndModify: false },
                        );
                        return res.status(200).json(leave);
                    }
                });
            } else {
                var from_leave = common.formatDate(new Date(leave_data.dateFrom));
                var today = common.formatDate(new Date());
                if (from_leave >= today){
                    return common.sendJSONResponse(res, 0, "You are not eligible to cancel or decline the leave.", null);
                }
                if (leave_data.status == 'Approved'){
                    let date = new Date(leave_data.dateFrom);
                    var old_date = common.formatDate(date);
                    var new_date = date.setDate(date.getDate() + leave_data.noOfDays);
                    new_date = common.formatDate(new_date);
                    await Attendance.deleteMany({student: ObjectId(leave_data.student), date: { $gte: old_date + ' 00:00:00', $lte: new_date + ' 23:59:59' } });
                }
                var leave = await Leave.findOneAndUpdate(
                    { _id: fields.leave_id },
                    { $set: { status: fields.status, updated_by: req.params.id } },
                    { new: true, useFindAndModify: false },
                );
                return common.sendJSONResponse(res, 1, "Leave approved successfully", leave);
            }
        } else {
            if (fields.status == "Approved"){
                var date = leave_data.dateFrom;
                var params = [];
                for (let i = 0; i < leave_data.noOfDays; i++) {
                    if ((leave_data.type_from == 'half' && i == 0) || leave_data.type_to == 'half' && i == (leave_data.noOfDays - 1)){
                        var attendance_status = 'HF';
                    } else {
                        var attendance_status = 'L';
                    }
                    if (i == 0){
                        var new_date = new Date(date);
                    } else {
                        var new_date = new Date(date.setDate(date.getDate() + 1));
                    }
                    params.push({
                        date: common.formatDate(new_date),
                        attendance_status: attendance_status,
                        staff: leave_data.staff,
                        school: leave_data.school,
                        department: leave_data.department,
                        session: leave_data.session,
                    });
                }
                StaffAttendance.insertMany(params, async function (error, result) {
                    if (error) {
                        console.log(error)
                        return common.sendJSONResponse(res, 0, "Problem in approving leave. Please try again.", null);
                    } else {
                        leave = await Leave.findOneAndUpdate(
                            { _id: fields.leave_id },
                            { $set: { status: fields.status, updated_by: req.params.id } },
                            { new: true, useFindAndModify: false },
                        );
                        return common.sendJSONResponse(res, 1, "Leave approved successfully", leave);
                    }
                });
            } else {
                var from_leave = common.formatDate(new Date(leave_data.dateFrom));
                var today = common.formatDate(new Date());
                if (from_leave >= today){
                    return common.sendJSONResponse(res, 0, "You are not eligible to cancel or decline the leave.", null);
                }
                if (leave_data.status == 'Approved'){
                    let date = new Date(leave_data.dateFrom);
                    var old_date = common.formatDate(date);
                    var new_date = date.setDate(date.getDate() + leave_data.noOfDays);
                    new_date = common.formatDate(new_date);
                    await StaffAttendance.deleteMany({student: ObjectId(leave_data.student), date: { $gte: old_date + ' 00:00:00', $lte: new_date + ' 23:59:59' } });
                }
                var leave = await Leave.findOneAndUpdate(
                    { _id: fields.leave_id },
                    { $set: { status: fields.status, updated_by: req.params.id } },
                    { new: true, useFindAndModify: false },
                );
                return common.sendJSONResponse(res, 1, "Leave approved successfully", leave);
            }
        }
    }
};


exports.getLeaveBySID = async (req, res) => {
    const sId = req.params.sId;
    let user = sId.slice(3, 6);
    let leave;
    if (user === "STD") {
        let student;
        try {
            student = await Student.find({ SID: sId });
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Student Not Found", null);
        }
        if (!student) {
            return common.sendJSONResponse(res, 0, "Student Not Found", null);
        }
        try {
            leave = await Leave.find({ student: student[0]._id });
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
        if ( ! leave) {
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
    } else if (user === "STF") {
        let staff;
        try {
            staff = await Staff.find({ SID: sId });
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Staff Not Found", null);
        }
        if ( ! staff) {
            return common.sendJSONResponse(res, 0, "Staff Not Found", null);
        }
        try {
            leave = await Leave.find({ staff: staff[0]._id });
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
        if ( ! leave) {
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
    }
    return common.sendJSONResponse(res, 1, "Leave fetched successfully", leave);
};

exports.getAllLeaves = async (req, res) => {
    let leave;
    try {
        leave = await Leave.find().populate("student").populate("staff");
    } catch (err) {
        console.log(err);
        return common.sendJSONResponse(res, 0, "No Leave Found", null);
    }
    if (!leave) {
        return common.sendJSONResponse(res, 2, "No Leave Found", null);
    }
    return common.sendJSONResponse(res, 0, "Leave fetched successfully", leave);
};

exports.getAllStaffLeaves = async (req, res) => {
    let leaves;
    try {
        leaves = await Leave.find({ type: "staff" })
            .populate("staff")
            .populate("department");
    } catch (err) {
        console.log(err);
        return common.sendJSONResponse(res, 0, "No Leave Found", leave);
    }
    if (!leaves) {
        return common.sendJSONResponse(res, 0, "No Leave Found", leave);
    }
    return common.sendJSONResponse(res, 1, "Leave fetched successfully", leaves);
};

exports.getAllStudentLeaves = async (req, res) => {
    let leaves;
    try {
        leaves = await Leave.find({ type: "student" })
            .populate("student")
            .populate("class")
            .populate("section");
    } catch (err) {
        console.log(err);
        return common.sendJSONResponse(res, 2, "No Leave Found", null);
    }
    if (!leaves) {
        return common.sendJSONResponse(res, 2, "No Leave Found", null);
    }
    return common.sendJSONResponse(res, 1, "Leave fetched successfully", leaves);
};

exports.deleteLeaveById = async (req, res) => {
    const sId = req.params.sId;
    const leaveId = req.params.leaveId;
    // console.log(sId);
    let user = sId.slice(3, 6);
    let student;
    let staff;
    let leave;
    if (user === "STD") {
        try {
            student = await Student.find({ SID: sId });
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Student Not Found", null);
        }
        if (!student) {
            return common.sendJSONResponse(res, 0, "Student Not Found", null);
        }
        try {
            leave = await Leave.findById(leaveId);
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
        if (!leave) {
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
        try {
            await leave.remove();
        } catch (err) {
            console.log(err);
        }
        return common.sendJSONResponse(res, 1, "Leave Deleted", true);
    } else if (user === "STF") {
        try {
            staff = await Staff.find({ SID: sId });
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Staff Not Found", null);
        }
        if ( ! staff) {
            return common.sendJSONResponse(res, 0, "Staff Not Found", null);
        }
        try {
            leave = await Leave.findById(leaveId);
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
        if ( ! leave) {
            return common.sendJSONResponse(res, 0, "No Leave Found", null);
        }
        try {
            await leave.remove();
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Problem in deleting leave. Please try again.", null);
        }
        return common.sendJSONResponse(res, 1, "Leave Deleted", true);
    }
};

exports.getLeavesByStaff = async (req, res) => {
    const sId = req.params.sId;
    let staff;
    try {
        staff = await Staff.findOne({ SID: sId });
    } catch (err) {
        console.log(err);
        return common.sendJSONResponse(res, 0, "Staff Not Found.", null);
    }
    if (!staff) {
        return common.sendJSONResponse(res, 0, "Staff Not Found.", null);
    }
    let studentLeave = [];
    let staffLeave = [];

    if (staff.isHead === true) {
        try {
            staffLeave = await Leave.find({ department: staff.head })
                .populate("staff")
                .populate("department");
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Problem in fetching leaves. Please try again.", null);
        }
    }
    if (staff.isClassTeacher === true) {
        try {
            studentLeave = await Leave.find({ section: staff.schoolClassTeacher })
                .populate("student")
                .populate("class")
                .populate("section");
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Problem in fetching leaves. Please try again.", null);
        }
    }

    return common.sendJSONResponse(res, 1, "Leave fetched successfully.", true);
};


exports.getStaffLeaves = async (req, res) => {
    var fields = req.body;
    var rules = {
        staff_id: 'required',
        session: 'required',
    }
    if (common.checkValidationRulesJson(fields, res, rules, 'M')) {
        try {
            staffLeave = await Leave.find({ staff: ObjectId(fields.staff_id), session: ObjectId(fields.session) })
                .populate("staff",'_id firstname lastname')
            if (staffLeave.length > 0){
                return common.sendJSONResponse(res, 1, "Leaves fetched successfully.", staffLeave);
            } else {
                return common.sendJSONResponse(res, 2, "No leave is available.", []);
            }
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Problem in fetching leaves. Please try again.", null);
        }
    }
};


exports.getStudentLeaves = async (req, res) => {
    var fields = req.body;
    var rules = {
        student_id: 'required',
        session: 'required',
    }
    if (common.checkValidationRulesJson(fields, res, rules, 'M')) {
        try {
            staffLeave = await Leave.find({ student: ObjectId(fields.student_id), session: ObjectId(fields.session) })
                .populate("student",'_id firstname lastname')
            if (staffLeave.length > 0){
                return common.sendJSONResponse(res, 1, "Leaves fetched successfully.", staffLeave);
            } else {
                return common.sendJSONResponse(res, 2, "No leave is available.", []);
            }
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Problem in fetching leaves. Please try again.", null);
        }
    }
};

