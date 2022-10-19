//import require models
const Student = require("../model/student");
const Section = require("../model/section");
const common = require("../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Assignment = require("../model/assignment");
const StudentAssignment = require("../model/student_assignment_submission");
const asyncLoop = require('node-async-loop');


exports.createAssignment = (req, res) => {
    var rules = {
        title: 'required',
        assignment_date: 'required',
        submission_date: 'required',
        marks: 'required',
        document: 'required',
        type: 'required',
        subject: 'required',
        subject_id: 'required',
        class: 'required',
        section: 'required'
    }
    if (req.body.type && req.body.type == 'I'){
        rules.student = 'required';
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        if (req.body.assignment_id) {
            Assignment.findOneAndUpdate(
                { _id: ObjectId(req.body.assignment_id) },
                { $set: {
                    title: req.body.title,
                    assignment_date: req.body.assignment_date,
                    submission_date: req.body.submission_date,
                    marks: req.body.marks,
                    document: req.body.document,
                    type: req.body.type,
                    subject_id: req.body.subject_id,
                    subject: req.body.subject,
                    class: req.body.class,
                    section: req.body.section,
                    student: req.body.student,
                } },
                { new: true, useFindAndModify: false },
            )
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err || ! result) {
                        if (err){
                            console.log(err)
                        }
                        return common.sendJSONResponse(res, 0, "Assignment is not available.", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Assignment updated successfully", result);
                    }
                });
        } else {
            let assignment_details = new Assignment({
                title: req.body.title,
                assignment_date: req.body.assignment_date,
                submission_date: req.body.submission_date,
                marks: req.body.marks,
                document: req.body.document,
                type: req.body.type,
                subject: req.body.subject,
                school: req.params.schoolID,
                subject_id: req.body.subject_id,
                is_active: 'Y',
                is_deleted: 'N',
                student: req.body.student,
                class: req.body.class,
                section: req.body.section,
            });
            try {
                assignment_details.save((err, result) => {
                    if (err) {
                        console.log(err);
                        return common.sendJSONResponse(res, 0, "Please Check Data!", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Assignment added successfully", result);
                    }
                });
            } catch (error) {
                console.log(error);
                return common.sendJSONResponse(res, 0, "Problem in updating assignment data. Please try again.", null);
            }
        }
    }
};


exports.assignmentList = (req, res) => {
    var rules = {
        class: 'required',
        section: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            Assignment.find({ school: ObjectId(req.params.schoolID), class: ObjectId(req.body.class), section: ObjectId(req.body.section), is_active: 'Y', is_deleted: 'N' })
                .populate('class', '_id name abbreviation')
                .populate('section', '_id name abbreviation')
                .populate('student', '_id firstname lastname email phone')
                .sort({ createdAt: -1 })
                .then(async (result, err) => {
                    if (err || !result) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Assignment is not available", null);
                    } else {
                        var output = [];
                        asyncLoop(result, function (item, next) { // It will be executed one by one
                            common.getFileStreamCall(item.document, function(response){
                                output.push({
                                    "type": item.type,
                                    "student": item.student,
                                    "is_active": item.is_active,
                                    "is_deleted": item.is_deleted,
                                    "_id": item._id,
                                    "title": item.title,
                                    "assignment_date": item.assignment_date,
                                    "submission_date": item.submission_date,
                                    "marks": item.marks,
                                    "document": item.document.jpg,
                                    "subject": item.subject,
                                    "school": item.school,
                                    "class": item.class,
                                    "section": item.section,
                                    "createdAt": item.createdAt,
                                    "updatedAt": item.updatedAt,
                                    "document_url": response
                                })
                                next();
                            });
                        }, function (err) {
                            return common.sendJSONResponse(res, 1, "Assignment fetched successfully", output);
                        });
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching building data. Please try again.", null);
        }
    }
};


exports.submitAssignment = (req, res) => {
    var rules = {
        assignment: 'required',
        document: 'required',
        student: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        Assignment.findOne({ school: ObjectId(req.params.schoolID), student: ObjectId(req.body.student), assignment: ObjectId(req.body.assignment), is_deleted: 'N' })
        .then((data, err) => {
            if (err) {
                console.log(err);
                return common.sendJSONResponse(res, 0, "Problem in updating assignment data. Please try again.", null);
            } else {
                if (data){
                    StudentAssignment.findOneAndUpdate(
                        { _id: ObjectId(data._id) },
                        { $set: {
                            assignment: req.body.assignment,
                            remarks: req.body.remarks,
                            document: req.body.document,
                        } },
                        { new: true, useFindAndModify: false },
                    )
                        .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err || ! result) {
                                if (err){
                                    console.log(err)
                                }
                                return common.sendJSONResponse(res, 0, "Assignment is not available.", null);
                            } else {
                                return common.sendJSONResponse(res, 1, "Assignment updated successfully", result);
                            }
                        });
                } else {
                    let assignment_details = new StudentAssignment({
                        assignment: req.body.assignment,
                        remarks: req.body.remarks,
                        document: req.body.document,
                        student: req.body.student,
                        school: req.params.schoolID,
                        is_active: 'Y',
                        is_deleted: 'N',
                    });
                    try {
                        assignment_details.save((err, result) => {
                            if (err) {
                                console.log(err);
                                return common.sendJSONResponse(res, 0, "Please Check Data!", null);
                            } else {
                                return common.sendJSONResponse(res, 1, "Assignment added successfully", result);
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        return common.sendJSONResponse(res, 0, "Problem in updating assignment data. Please try again.", null);
                    }
                }
            }
          });
    }
};



exports.subjectList = (req, res) => {
    var rules = {
        student: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            Student.findOne({ _id: ObjectId(req.body.student) })
                .populate({
                    path: "section",
                    populate: {
                        path: "subject",
                        // select: "_id name"
                    },
                    // select: "firstname lastname gender _id email phone"
                })
                .sort({ createdAt: -1 })
                .then(async (result, err) => {
                    if (err || ! result) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Student not found", null);
                    } else {
                        var subject_data = result.section.subject;
                        var subject = [];
                        subject_data.forEach(sub_result => {
                            if (sub_result.type == 'Single'){
                                subject.push(sub_result.name);
                            } else {
                                sub_result.list.forEach(r => {
                                    subject.push(r);
                                });
                            }
                        });
                        var final_output = [];
                        asyncLoop(subject, function (item, next) { // It will be executed one by one
                            Assignment.countDocuments({
                                subject: item,
                                school: ObjectId(req.params.schoolID),
                                $or:[ {'type': 'A'}, {'student': ObjectId(req.body.student)}],
                                is_active: 'Y',
                                is_deleted: 'N'
                            }).then(output => {
                                var count = output;
                                Assignment.findOne({
                                    subject: item,
                                    school: ObjectId(req.params.schoolID),
                                    $or:[ {'type': 'A'}, {'student': ObjectId(req.body.student)}],
                                    is_active: 'Y',
                                    is_deleted: 'N'
                                }).sort({updatedAt: -1}).then(output => {
                                    if (output){
                                        final_output.push({
                                            subject: item,
                                            last_updated: output.updatedAt,
                                            total_assignment: count
                                        })
                                    } else {
                                        final_output.push({
                                            subject: item,
                                            last_updated: '',
                                            total_assignment: count
                                        })
                                    }
                                    next();
                                });
                            })
                        }, function (err) {
                            return common.sendJSONResponse(res, 1, "Subject list fetched successfully", final_output);
                        });
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching building data. Please try again.", null);
        }
    }
};


exports.subjectAssignmentList = (req, res) => {
    var rules = {
        student: 'required',
        subject: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            var pending = [];
            var submitted = [];
            Student.findOne({
                _id: ObjectId(req.body.student),
            }).sort({updatedAt: -1}).then(output => {
                if ( ! output){
                    return common.sendJSONResponse(res, 0, "Invalid student", null);
                } else {
                    Assignment.find({
                        subject: req.body.subject,
                        school: ObjectId(req.params.schoolID),
                        class: ObjectId(output.class),
                        section: ObjectId(output.section),
                        $or:[ {'type': 'A'}, {'student': ObjectId(req.body.student)}],
                        is_active: 'Y',
                        is_deleted: 'N'
                    }).sort({updatedAt: -1}).then(output => {
                        if (output.length > 0){
                            var assignment_ids = [];
                            output.forEach(result => {
                                assignment_ids.push(ObjectId(result._id));
                            });
                            StudentAssignment.find({assignment : { "$in": assignment_ids }, student: ObjectId(req.body.student)}).then(submit => {
                                var available = false;
                                for (var i = 0; i < output.length; i++){
                                    available = false;
                                    for (var j = 0; j < submit.length; j++){
                                        if (output[i]._id.toString() == submit[j].assignment.toString()){
                                            submitted.push(output[i]);
                                            available = true;
                                            break;
                                        }
                                    }
                                    if ( ! available){
                                        pending.push(output[i]);
                                    }
                                }
                                return common.sendJSONResponse(res, 1, "Subject list fetched successfully", {pending, submitted});
                            });
                        } else {
                            return common.sendJSONResponse(res, 2, "Assignment not available", output);
                        }
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching building data. Please try again.", null);
        }
    }
};


exports.assignmentDetailsById = (req, res) => {
    var rules = {
        assignment_id: 'required',
        student: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            Assignment.findOne({
                _id: ObjectId(req.body.assignment_id),
                school: ObjectId(req.params.schoolID),
                is_deleted: 'N'
            }).sort({updatedAt: -1}).then(output => {
                if ( ! output){
                    return common.sendJSONResponse(res, 0, "Invalid assignment", null);
                } else {
                    common.getFileStreamCall(output.document, function(response){
                        StudentAssignment.findOne({assignment : ObjectId(req.body.assignment_id), student: ObjectId(req.body.student)}).then(submit => {
                            if (submit){
                                common.getFileStreamCall(submit.document, function(submit_response){
                                    var result = {
                                        "type": output.type,
                                        "student": output.student,
                                        "is_active": output.is_active,
                                        "is_deleted": output.is_deleted,
                                        "_id": output._id,
                                        "title": output.title,
                                        "assignment_date": output.assignment_date,
                                        "submission_date": output.submission_date,
                                        "document_url": response,
                                        "marks": output.marks,
                                        "document": output.document,
                                        "subject": output.subject,
                                        "school": output.school,
                                        "class": output.class,
                                        "section": output.section,
                                        "createdAt": output.createdAt,
                                        "updatedAt": output.updatedAt,
                                        "submit": {
                                            "is_active": submit.is_active,
                                            "is_deleted": submit.is_deleted,
                                            "_id": submit._id,
                                            "assignment": submit.assignment,
                                            "document": submit_response,
                                            "student": submit.student,
                                            "school": submit.school,
                                            "createdAt": submit.createdAt,
                                            "updatedAt": submit.updatedAt,
                                        }
                                    }
                                    return common.sendJSONResponse(res, 1, "Assignment Details fetched successfully.", result);

                                });
                            } else {
                                var result = {
                                    "type": output.type,
                                    "student": output.student,
                                    "is_active": output.is_active,
                                    "is_deleted": output.is_deleted,
                                    "_id": output._id,
                                    "title": output.title,
                                    "assignment_date": output.assignment_date,
                                    "submission_date": output.submission_date,
                                    "document_url": response,
                                    "marks": output.marks,
                                    "document": output.document,
                                    "subject": output.subject,
                                    "school": output.school,
                                    "class": output.class,
                                    "section": output.section,
                                    "createdAt": output.createdAt,
                                    "updatedAt": output.updatedAt,
                                    submit
                                }

                                return common.sendJSONResponse(res, 1, "Assignment Details fetched successfully.", result);
                            }
                        });
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching building data. Please try again.", null);
        }
    }
};



exports.assignmentSubmitStudent = (req, res) => {
    var rules = {
        assignment_id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            StudentAssignment.find({assignment: ObjectId(req.body.assignment_id)})
            .populate('student', '_id firstname lastname email phone')
            .populate('assignment', '_id title assignment_date submission_date marks')
            .then((result, err) => {
                if (err){
                    console.log(err);
                   return common.sendJSONResponse(res, 0, "Problem in fetching assignment list. Please try again.", null);
                } else {
                    if (result.length > 0){
                        var output = [];
                        asyncLoop(result, function (item, next) { // It will be executed one by one
                            common.getFileStreamCall(item.document, function(submit_response){
                                output.push({...item.toObject(), document_url: submit_response});
                                next();
                            });
                        }, function (err) {
                            return common.sendJSONResponse(res, 1, "Assignment list fetched successfully", output);
                        });
                    } else {
                        return common.sendJSONResponse(res, 2, "No assignment is submitted", null);
                    }
                }
            })
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching assignment list. Please try again.", null);
        }
    }
};


exports.updateAssignmentMarks = (req, res) => {
    var rules = {
        student_assignment_id: 'required',
        marks: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            StudentAssignment.findOne({_id: ObjectId(req.body.student_assignment_id)})
            .populate('student', '_id firstname lastname email phone')
            .populate('assignment', '_id title assignment_date submission_date marks')
            .then((result, err) => {
                if (err){
                    console.log(err);
                   return common.sendJSONResponse(res, 0, "Problem in fetching assignment list. Please try again.", null);
                } else if ( ! result) {
                    return common.sendJSONResponse(res, 0, "Assignment not available", null);
                } else {
                    var marks = result.assignment.marks;
                    if (marks < req.body.marks){
                        return common.sendJSONResponse(res, 0, "Student marks must not be grater than assignment marks", null);
                    } else {
                        StudentAssignment.findOneAndUpdate(
                            { _id: ObjectId(req.body.student_assignment_id) },
                            { $set: {
                                marks: req.body.marks,
                                remarks: req.body.remarks,
                            } },
                            { new: true, useFindAndModify: false },
                        )
                            .sort({ createdAt: -1 })
                            .then((result, err) => {
                                if (err || ! result) {
                                    if (err){
                                        console.log(err)
                                    }
                                    return common.sendJSONResponse(res, 0, "Problem in updating student assignment marks. Please try again.", null);
                                } else {
                                    return common.sendJSONResponse(res, 1, "Assignment marks updated successfully", result);
                                }
                            });
                    }
                }
            })
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching assignment list. Please try again.", null);
        }
    }
};


exports.deleteAssignment = (req, res) => {
    var rules = {
        assignment_id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            Assignment.findOneAndUpdate(
                { _id: ObjectId(req.body.assignment_id) },
                { $set: {
                    is_active: 'N',
                    is_deleted: 'Y',
                } },
                { new: true, useFindAndModify: false },
            )
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err || ! result) {
                        if (err){
                            console.log(err)
                        }
                        return common.sendJSONResponse(res, 0, "Problem in deleting assignment. Please try again.", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Assignment Deleted Successfully", true);
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching assignment list. Please try again.", null);
        }
    }
};