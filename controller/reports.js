const formidable = require("formidable");

//import require models
const Student = require("../model/student");
const Staff = require("../model/staff");
const staffAttandance = require("../model/staff_attandance");
const studentAttandance = require("../model/attendance");
const ExamSchema = require("../model/exam_master");
const ExamSubjectSchema = require("../model/exam_subject_master");
const StudentMarks = require("../model/student_marks");
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
                                return res.status(200).json(result);
                            }
                        });
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



exports.studentAttandance = (req, res) => {
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
                    studentAttandance.find(params)
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
                                return res.status(200).json(result);
                            }
                        });
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

