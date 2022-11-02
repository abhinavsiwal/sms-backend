const formidable = require("formidable");

//import require models
const GradeSchema = require("../model/grade_master");
const ExamSchema = require("../model/exam_master");
const ExamSubjectSchema = require("../model/exam_subject_master");
const StudentMarks = require("../model/student_marks");
const common = require("../config/common");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.updateGrades = (req, res) => {
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
                grades_data: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                var error = true;
                JSON.parse(fields.grades_data).forEach(doc_data => {
                    if ( ! doc_data.min && error){
                        error = false;
                        return res.status(400).json({
                            err: "Min is required",
                        });
                    } else if ( ! doc_data.max && error){
                        error = false;
                        return res.status(400).json({
                            err: "Max is required",
                        });
                    } else if ( ! doc_data.grade && error){
                        error = false;
                        return res.status(400).json({
                            err: "Grade is required",
                        });
                    } else if ( ! doc_data.description && error){
                        error = false;
                        return res.status(400).json({
                            err: "Description is required",
                        });
                    }
                });
                if (error){
                    GradeSchema.updateMany({school: req.params.schoolID},{
                        $set: {
                            is_active: 'N',
                            is_deleted: 'Y'
                        },
                    },
                    (err, data) => {
                        if (err) {
                            return res.status(400).json({
                                err: "Problem in uploading documents. Please try again.",
                            });
                        } else {
                            var final_data = [];
                            if (JSON.parse(fields.grades_data).length > 0){
                                asyncLoop(JSON.parse(fields.grades_data), function (item, next) { // It will be executed one by one
                                    if (item._id){
                                        var params = {
                                            min: item.min,
                                            max: item.max,
                                            grade: item.grade,
                                            description: item.description,
                                            school: req.params.schoolID,
                                            updatedBy: req.params.id,
                                            is_active: 'Y',
                                            is_deleted: 'N'
                                        }
                                        GradeSchema.findOneAndUpdate(
                                            {_id: ObjectId(fields._id)},
                                            { $set: params },
                                            {new:true, useFindAndModify: false},
                                        )
                                        .sort({ createdAt: -1 })
                                        .then((result, err) => {
                                            if (err || ! result){
                                                if (err){
                                                    console.log(err);
                                                }
                                                return res.status(400).json({
                                                    err: "Problem in updating grades. Please try again.",
                                                });
                                            } else {
                                                final_data.push(result);
                                                next();
                                            }
                                        });
                                    } else {
                                        var params = {
                                            min: item.min,
                                            max: item.max,
                                            grade: item.grade,
                                            description: item.description,
                                            school: req.params.schoolID,
                                            updatedBy: req.params.id,
                                            is_active: 'Y',
                                            is_deleted: 'N'
                                        }
                                        var documents_data = new GradeSchema(params);
                                        documents_data.save(function(err,result){
                                            if (err){
                                                console.log(err);
                                                return res.status(400).json({
                                                    err: "Problem in updating grades. Please try again.",
                                                });
                                            } else {
                                                final_data.push(result);
                                                next();
                                            }
                                        })
                                    }
                                }, function (err) {
                                    return res.status(200).json(final_data);
                                });
                            } else {
                                return res.status(200).json([]);
                            }
                        }
                    });
                }
            }
        }
    });
};

exports.getGrades = (req, res) => {
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
                        is_deleted: 'N'
                    };
                    GradeSchema.find(params)
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting grades. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting grades. Please try again.",
                    });
                }
            }
        }
    });
};


exports.updateExam = (req, res) => {
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
                exam_data: 'required',
                name: 'required',
                class: 'required',
                section: 'required',
                session: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var exam_data = JSON.parse(fields.exam_data);
                    var error = true;
                    exam_data.forEach(result => {
                        if ( ! result.full_marks && error){
                            error = false;
                            return res.status(400).json({
                                err: "Full marks is required",
                            });
                        } else if ( ! result.passing_marks && error){
                            error = false;
                            return res.status(400).json({
                                err: "Passing marks is required",
                            });
                        } else if ( ! result.subject && error){
                            error = false;
                            return res.status(400).json({
                                err: "Subject is required",
                            });
                        }
                    });

                    var params = {
                        school: ObjectId(req.params.schoolID),
                        class: ObjectId(fields.class),
                        section: ObjectId(fields.section),
                        session: ObjectId(fields.session),
                        is_deleted: 'N',
                    };
                    ExamSchema.findOne(params)
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting exam data. Please try again.",
                                });
                            } else {
                                if ( ! result){
                                    var params = {
                                        name: fields.name,
                                        class: fields.class,
                                        section: fields.section,
                                        session: fields.session,
                                        school: req.params.schoolID,
                                        updatedBy: req.params.id,
                                        is_active: 'Y',
                                        is_deleted: 'N'
                                    }
                                    var documents_data = new ExamSchema(params);
                                    documents_data.save(function(err,result){
                                        if (err){
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in updating grades. Please try again.",
                                            });
                                        } else {
                                            fields.id = result._id;
                                            update_sub_exam_data(fields, function(response){
                                                if (response){
                                                    return res.status(200).json(result);
                                                } else {
                                                    return res.status(400).json({
                                                        err: "Problem in updating exam subjects. Please try again.",
                                                    });
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    ExamSchema.findOneAndUpdate(
                                        {_id: ObjectId(result._id)},
                                        { $set: {
                                            name: fields.name,
                                            updatedBy: req.params.id,
                                            is_active: 'Y',
                                        } },
                                        { new: true, useFindAndModify: false },
                                    )
                                        .sort({ createdAt: -1 })
                                        .then((result, err) => {
                                            if (err || !result) {
                                                if (err){
                                                    console.log(err);
                                                }
                                                return res.status(400).json({
                                                    err: "Problem in updating exam data. Please try again.",
                                                });
                                            } else {
                                                fields.id = result._id;
                                                update_sub_exam_data(fields, function(response){
                                                    if (response){
                                                        return res.status(200).json(result);
                                                    } else {
                                                        return res.status(400).json({
                                                            err: "Problem in updating exam subjects. Please try again.",
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                }
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting grades. Please try again.",
                    });
                }
            }
        }
    });
};

function update_sub_exam_data(fields, callback){
    ExamSubjectSchema.deleteMany({ exam_master_id: ObjectId(fields.id) }, function (err) {
        if (err) {
            console.log(err);
            callback(false);
        } else {
            var exam_data = JSON.parse(fields.exam_data);
            var params = [];
            exam_data.forEach(res => {
                params.push({
                    "exam_master_id": fields.id,
                    "full_marks": res.full_marks,
                    "passing_marks": res.passing_marks,
                    "subject": res.subject,
                    "sub_subject": res.sub_subject
                });
            })
            ExamSubjectSchema.insertMany(params, function (error, result) {
                if (error) {
                    console.log(error)
                    callback(false);
                } else {
                    callback(true);
                }
            });
        }
    });
}


exports.updateMarks = (req, res) => {
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
                exam_id: 'required',
                exam_data: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    ExamSubjectSchema.find({ _id: ObjectId(fields._id) })
                    .sort({ min: 1 })
                        .then((exam_details, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting exam data. Please try again.",
                                });
                            } else {
                                if ( ! exam_details){
                                    return res.status(400).json({
                                        err: "Exam details not available.",
                                    });
                                } else {
                                    var exam_data = JSON.parse(fields.exam_data);
                                    var error = true;
                                    exam_data.forEach(result => {
                                        if ( ! result.marks && error){
                                            error = false;
                                            return res.status(400).json({
                                                err: "Marks is required",
                                            });
                                        } else if ( ! result.present && error){
                                            error = false;
                                            return res.status(400).json({
                                                err: "Passing is required",
                                            });
                                        } else if ( ! result.subject && error){
                                            error = false;
                                            return res.status(400).json({
                                                err: "Subject is required",
                                            });
                                        } else if ( ! result.student && error){
                                            error = false;
                                            return res.status(400).json({
                                                err: "Student is required",
                                            });
                                        }
                                    });
                                }

                                if (error){
                                    var available = false;
                                    var minMax = false;
                                    for (var i = 0; i < exam_data.length; i++){
                                        available = false;
                                        for (var j = 0; j < exam_details.length; j++){
                                            if (exam_details[j].subject == exam_data[i].subject){
                                                if (parseInt(exam_details[j].min) <= parseInt(exam_data[i].marks) <= parseInt(exam_details[j].max)){
                                                    minMax = true;
                                                }
                                                available = true;
                                                break;
                                            }
                                        }
                                        if (available){
                                            return res.status(400).json({
                                                err: "Subject is not available in exam master. Please update the subject details in exam master",
                                            });
                                            break;
                                        }
                                        if (minMax){
                                            return res.status(400).json({
                                                err: "Given marks must be in range of minimum and maximum marks",
                                            });
                                            break;
                                        }
                                    }
                                    if ( ! available && ! minMax){
                                        var final_data = [];
                                        asyncLoop(JSON.parse(fields.exam_data), function (item, next) { // It will be executed one by one
                                            if (item._id){
                                                var params = {
                                                    exam: fields.exam_id,
                                                    subject: item.subject,
                                                    marks: item.marks,
                                                    present: item.present,
                                                    student: item.student,
                                                    school: req.params.schoolID,
                                                    updatedBy: req.params.id,
                                                    is_active: 'Y',
                                                    is_deleted: 'N'
                                                }
                                                StudentMarks.findOneAndUpdate(
                                                    {_id: ObjectId(fields._id)},
                                                    { $set: params },
                                                    {new:true, useFindAndModify: false},
                                                )
                                                .sort({ createdAt: -1 })
                                                .then((result, err) => {
                                                    if (err || ! result){
                                                        if (err){
                                                            console.log(err);
                                                        }
                                                        return res.status(400).json({
                                                            err: "Problem in updating marks. Please try again.",
                                                        });
                                                    } else {
                                                        final_data.push(result);
                                                        next();
                                                    }
                                                });
                                            } else {
                                                var params = {
                                                    exam: fields.exam_id,
                                                    subject: item.subject,
                                                    marks: item.marks,
                                                    present: item.present,
                                                    student: item.student,
                                                    school: req.params.schoolID,
                                                    updatedBy: req.params.id,
                                                    is_active: 'Y',
                                                    is_deleted: 'N'
                                                }
                                                var documents_data = new StudentMarks(params);
                                                documents_data.save(function(err,result){
                                                    if (err){
                                                        console.log(err);
                                                        return res.status(400).json({
                                                            err: "Problem in updating marks. Please try again.",
                                                        });
                                                    } else {
                                                        final_data.push(result);
                                                        next();
                                                    }
                                                })
                                            }
                                        }, function (err) {
                                            return res.status(200).json(final_data);
                                        });
                                    }
                                }
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating marks. Please try again.",
                    });
                }
            }
        }
    });
};


exports.getMarks = (req, res) => {
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
                exam_id: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var params = {
                        exam: ObjectId(fields.exam_id),
                        school: ObjectId(req.params.schoolID),
                        is_deleted: 'N'
                    };
                    StudentMarks.find(params)
                    .populate('student', '_id firstname lastname email phone')
                    .populate('exam')
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting marks. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting marks. Please try again.",
                    });
                }
            }
        }
    });
};


exports.getExam = (req, res) => {
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
                class: 'required',
                section: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var params = {
                        class: ObjectId(fields.class),
                        section: ObjectId(fields.section),
                        school: ObjectId(req.params.schoolID),
                        is_deleted: 'N'
                    };
                    ExamSchema.find(params)
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting exam. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting exam. Please try again.",
                    });
                }
            }
        }
    });
};


exports.studentMarksList = (req, res) => {
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
                exam_id: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var params = {
                        exam: ObjectId(fields.exam_id),
                        school: ObjectId(req.params.schoolID),
                        is_deleted: 'N'
                    };
                    StudentMarks.find(params)
                    .sort({ min: 1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting exam. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting exam. Please try again.",
                    });
                }
            }
        }
    });
};
