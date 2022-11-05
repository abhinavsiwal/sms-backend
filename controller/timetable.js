//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Timetable = require("../model/timetable");
const PeriodMaster = require("../model/period_master");
const ClassTimeTable = require("../model/class_time_table");
const Department = require("../model/department");
const Staff = require("../model/staff");
const common = require("../config/common");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//exports routes controller
exports.getTimetableByID = (req, res, next, id) => {
    try {
        Timetable.findById(id).exec((err, timetable) => {
            if (err || !timetable) {
                return res.status(400).json({
                    err: "No TimeTable was found in Database",
                });
            }
            req.timetable = timetable;
            next();
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createTimetable = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        }
        let timetable = new Timetable(fields);
        try {
            timetable.lecture = JSON.parse(fields.lecture);
            timetable.timeSlots = JSON.parse(fields.timeSlots);
            timetable.working_day = JSON.parse(fields.working_day);
            timetable.save((err, timetable) => {
                if (err) {
                    return res.status(400).json({
                        err: "Please check your data!",
                    });
                }
                res.json(timetable);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getTimetable = (req, res) => {
    req.json(req.timetable);
};

exports.updateTimetable = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }

        let timetable = req.timetable;
        timetable = _.extend(timetable, fields);
        try {
            if (fields.lecture) {
                timetable.lecture = JSON.parse(fields.lecture);
            }
            timetable.save((err, timetable) => {
                if (err) {
                    return res.status(400).json({
                        err: "Update timetable in Database is Failed",
                    });
                }
                res.json(timetable);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getAllTimetable = (req, res) => {
    try {
        Timetable.find({ school: req.schooldoc._id })
            .populate("class")
            .populate("section")
            .sort({ createdAt: -1 })
            .then((timetable, err) => {
                if (err || !timetable) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                return res.json(timetable);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.getAllTimetableByFilter = (req, res) => {
    let classs = req.body.class;
    let sections = req.body.section;
    try {
        Timetable.findOne({
            class: classs,
            section: sections,
            school: req.schooldoc._id,
        })
            .populate("class")
            .populate("section")
            .sort({ createdAt: -1 })
            .then((timetable, err) => {
                if (err) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                return res.json(timetable);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.deleteTimetable = (req, res) => {
    let timetable = req.timetable;
    try {
        timetable.remove((err, timetable) => {
            if (err || !timetable) {
                return res.status(400).json({
                    err: "Can't Able To Delete timetable",
                });
            }
            return res.json({
                Massage: `timetable is Deleted SuccessFully`,
            });
        });
    } catch (error) {
        console.log(error);
    }
};

exports.updatePeriod = (req, res) => {
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
                section: 'required',
                start: 'required',
                end: 'required',
                type: 'required:in:P,R',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    PeriodMaster.find({ class: ObjectId(fields.class), section: ObjectId(fields.section), is_deleted: 'N' })
                        .sort({ min: 1 })
                        .then((period_details, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting periods. Please try again.",
                                });
                            } else {
                                if ( ! period_details || period_details.length == 0) {
                                    var params = {
                                        class: fields.class,
                                        section: fields.section,
                                        // day: fields.day,
                                        start: fields.start,
                                        end: fields.end,
                                        type: fields.type,
                                        school: req.params.schoolID,
                                        updated_by: req.params.id,
                                        is_active: 'Y',
                                        is_deleted: 'N'
                                    }
                                    var period_data = new PeriodMaster(params);
                                    period_data.save(function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in updating period. Please try again.",
                                            });
                                        } else {
                                            return res.status(200).json(result);
                                        }
                                    })
                                } else {
                                    var current_start = new Date('2022-12-12 ' + fields.start);
                                    var current_end = new Date('2022-12-12 ' + fields.end);
                                    console.log(period_details)
                                    for (var i = 0; i < period_details.length; i++){
                                        var start = new Date('2022-12-12 ' + period_details[i].start);
                                        var end = new Date('2022-12-12 ' + period_details[i].end);
                                        if ((common.changeDateFormat(start) == common.changeDateFormat(current_start)
                                            && common.changeDateFormat(end) == common.changeDateFormat(current_end))
                                            || (current_start > start && current_start < end)
                                            || (start > current_end && current_end < end)
                                            || (start >= current_start && end <= current_end)
                                            || (start <= current_start && end >= current_end)
                                            ){
                                            return res.status(400).json({
                                                err: "Invalid period time",
                                            });
                                            break;
                                        }
                                    }
                                    var params = {
                                        class: fields.class,
                                        section: fields.section,
                                        // day: fields.day,
                                        start: fields.start,
                                        end: fields.end,
                                        type: fields.type,
                                        school: req.params.schoolID,
                                        updated_by: req.params.id,
                                        is_active: 'Y',
                                        is_deleted: 'N'
                                    }
                                    var period_data = new PeriodMaster(params);
                                    period_data.save(function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in updating period. Please try again.",
                                            });
                                        } else {
                                            return res.status(200).json(result);
                                        }
                                    })
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

exports.deletePeriod = (req, res) => {
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
                period_id: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                PeriodMaster.findOneAndUpdate(
                    {_id: ObjectId(fields.period_id)},
                    { $set: {
                        is_active: 'N',
                        is_deleted: 'Y',
                        updatedBy: req.params.id,
                    } },
                    {new:true, useFindAndModify: false},
                )
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err || ! result) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in deleting budget. Please try again.",
                        });
                    } else {
                        return res.json({
                            Massage: `Deleted SuccessFully`,
                        });
                    }
                });
            }
        }
    });
};


exports.updateClassTimeTable = (req, res) => {
    var rules = {
        time_table_data: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules)) {
        try {
            var error = true;
            req.body.time_table_data.forEach(result => {
                if ( ! result.period_id && error){
                    error = false;
                    return res.status(400).json({
                        err: "Period id is required",
                    });
                } else if ( ! result.staff && error){
                    error = false;
                    return res.status(400).json({
                        err: "Staff is required",
                    });
                } else if ( ! result.subject && error){
                    error = false;
                    return res.status(400).json({
                        err: "Subject is required",
                    });
                } else if ( ! result.subject_id && error){
                    error = false;
                    return res.status(400).json({
                        err: "Subject id is required",
                    });
                } else if ( ! result.day && error){
                    error = false;
                    return res.status(400).json({
                        err: "Subject id is required",
                    });
                }
            });
            if (error){
                asyncLoop(req.body.time_table_data, function (item, next) { // It will be executed one by one
                    PeriodMaster.findOne({ _id: ObjectId(item.period_id) })
                    .sort({ min: 1 })
                    .then((period_details, err) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({
                                err: "Problem in getting periods. Please try again.",
                            });
                        } else {
                            if (period_details.length == 0){
                                return res.status(400).json({
                                    err: "Invalid Period",
                                });
                            } else {
                                ClassTimeTable.find({ staff: ObjectId(item.staff), is_deleted: 'N' })
                                .populate('staff', '_id firstname lastname')
                                .sort({ min: 1 })
                                .then((time_table_details, err) => {
                                    if (err) {
                                        console.log(err);
                                        return res.status(400).json({
                                            err: "Problem in updating time table. Please try again.",
                                        });
                                    } else {
                                        if (time_table_details.length > 0){
                                            asyncLoop(time_table_details, function (item_new, next_new) { // It will be executed one by one
                                                PeriodMaster.find({ _id: ObjectId(item_new.period_id), is_deleted: 'N' })
                                                .sort({ min: 1 })
                                                .then((period_details_new, err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(400).json({
                                                            err: "Problem in getting periods. Please try again.",
                                                        });
                                                    } else {
                                                        if (period_details_new.length > 0){
                                                            var current_start = new Date('2022-12-12 ' + period_details.start);
                                                            var current_end = new Date('2022-12-12 ' + period_details.end);
                                                            for (var i = 0; i < period_details_new.length; i++){
                                                                var start = new Date('2022-12-12 ' + period_details_new[i].start);
                                                                var end = new Date('2022-12-12 ' + period_details_new[i].end);
                                                                if ((item.period_id.toString() != item_new._id.toString()) &&
                                                                    ((common.changeDateFormat(start) == common.changeDateFormat(current_start)
                                                                    && common.changeDateFormat(end) == common.changeDateFormat(current_end))
                                                                    || (current_start > start && current_start < end)
                                                                    || (start > current_end && current_end < end)
                                                                    || (start >= current_start && end <= current_end)
                                                                    || (start <= current_start && end >= current_end)
                                                                )){
                                                                    return res.status(400).json({
                                                                        err: item_new.first_name + " already have another period please select diffrent teacher",
                                                                    });
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                        next_new();
                                                    }
                                                });
                                            }, function (err) {
                                                ClassTimeTable.findOne({ staff: ObjectId(item.staff), period_id: item.period_id, is_deleted: 'N' })
                                                .sort({ min: 1 })
                                                .then((class_time_table_details, err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(400).json({
                                                            err: "Problem in updating timetable. Please try again.",
                                                        });
                                                    } else {
                                                        if ( ! class_time_table_details){
                                                            var params = {
                                                                period_id: item.period_id,
                                                                staff: item.staff,
                                                                subject: item.subject,
                                                                day: item.day,
                                                                start: item.start,
                                                                end: item.end,
                                                                subject_id: item.subject_id,
                                                                school: req.params.schoolID,
                                                                updated_by: req.params.id,
                                                                is_active: 'Y',
                                                                is_deleted: 'N'
                                                            }
                                                            var period_data = new ClassTimeTable(params);
                                                            period_data.save(function (err, result) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    return res.status(400).json({
                                                                        err: "Problem in updating timetable. Please try again.",
                                                                    });
                                                                } else {
                                                                    next();
                                                                }
                                                            })
                                                        } else {
                                                            ClassTimeTable.findOneAndUpdate(
                                                                { _id: ObjectId(class_time_table_details._id) },
                                                                { $set: {
                                                                    period_id: item.period_id,
                                                                    staff: item.staff,
                                                                    subject: item.subject,
                                                                    day: item.day,
                                                                    start: item.start,
                                                                    end: item.end,
                                                                    subject_id: item.subject_id,
                                                                    school: req.params.schoolID,
                                                                    updated_by: req.params.id,
                                                                } },
                                                                { new: true, useFindAndModify: false },
                                                            )
                                                                .sort({ createdAt: -1 })
                                                                .then((result, err) => {
                                                                    console.log(result,err)
                                                                    if (err || ! result) {
                                                                        if (err){
                                                                            console.log(err)
                                                                        }
                                                                        return res.status(400).json({
                                                                            err: "Problem in updating timetable. Please try again.",
                                                                        });
                                                                    } else {
                                                                        console.log('dasdasdas')
                                                                        next();
                                                                    }
                                                                });
                                                        }
                                                    }
                                                });
                                            });
                                        } else {
                                            ClassTimeTable.findOne({ staff: ObjectId(item.staff), period_id: item.period_id, is_deleted: 'N' })
                                            .sort({ min: 1 })
                                            .then((class_time_table_details, err) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(400).json({
                                                        err: "Problem in updating timetable. Please try again.",
                                                    });
                                                    return;
                                                } else {
                                                    if ( ! class_time_table_details){
                                                        var params = {
                                                            period_id: item.period_id,
                                                            staff: item.staff,
                                                            subject: item.subject,
                                                            day: item.day,
                                                            start: item.start,
                                                            end: item.end,
                                                            subject_id: item.subject_id,
                                                            school: req.params.schoolID,
                                                            updated_by: req.params.id,
                                                            is_active: 'Y',
                                                            is_deleted: 'N'
                                                        }
                                                        var period_data = new ClassTimeTable(params);
                                                        period_data.save(function (err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                                return res.status(400).json({
                                                                    err: "Problem in updating timetable. Please try again.",
                                                                });
                                                                return;
                                                            } else {
                                                                console.log('asasdasd')
                                                                next();
                                                            }
                                                        })
                                                    } else {
                                                        ClassTimeTable.findOneAndUpdate(
                                                            { _id: ObjectId(class_time_table_details._id) },
                                                            { $set: {
                                                                period_id: item.period_id,
                                                                staff: item.staff,
                                                                subject: item.subject,
                                                                day: item.day,
                                                                start: item.start,
                                                                end: item.end,
                                                                subject_id: item.subject_id,
                                                                school: req.params.schoolID,
                                                                updated_by: req.params.id,
                                                            } },
                                                            { new: true, useFindAndModify: false },
                                                        )
                                                            .sort({ createdAt: -1 })
                                                            .then((result, err) => {
                                                                if (err || ! result) {
                                                                    if (err){
                                                                        console.log(err)
                                                                    }
                                                                    return res.status(400).json({
                                                                        err: "Problem in updating timetable. Please try again.",
                                                                    });
                                                                    return;
                                                                } else {
                                                                    next();
                                                                }
                                                            });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });

                }, function (err) {
                    return res.status(200).json({status: true});
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                err: "Problem in updating marks. Please try again.",
            });
        }
    }
};


exports.timeTableList = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        var rules = {
            class: 'required',
            section: 'required',
        }
        if (common.checkValidationRulesJson(fields, res, rules)) {
            try {
                var period_ids = [];
                PeriodMaster
                    .find({ school: req.params.schoolID, is_deleted: 'N', section: ObjectId(fields.section), class: ObjectId(fields.class) })
                    .populate({
                        path: 'period_id',
                    })
                    .populate('staff', '_id firstname lastname')
                    .sort({ createdAt: -1 })
                    .then((result, err) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({
                                err: "Problem in fetching timetable. Please try again.",
                            });
                        } else {
                            if (result.length > 0){
                                result.forEach(asd => {
                                    period_ids.push(ObjectId(asd._id));
                                })
                                ClassTimeTable
                                    .find({ school: req.params.schoolID, period_id: { "$in": period_ids }, is_deleted: 'N' })
                                    .populate({
                                        path: 'period_id',
                                    })
                                    .populate('staff', '_id firstname lastname')
                                    .sort({ createdAt: -1 })
                                    .exec((err,result) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in fetching timetable. Please try again.",
                                            });
                                        } else {
                                            return res.status(200).json(result);
                                        }
                                    });
                            } else {
                                return res.status(200).json([]);
                            }
                        }
                    });

            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    err: "Can't Able To fetch student list",
                });
            }
        }
    });
};


exports.teacherOccupancyList = (req, res) => {
    try {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, (err, fields, file) => {
        var rules = {
            session: 'required'
        }
        if (common.checkValidationRulesJson(fields, res, rules)) {
            Department
                .findOne({ school: ObjectId(req.params.schoolID), name: 'Teaching' })
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in fetching teacher occupancy. Please try again.",
                        });
                    } else if ( ! result) {
                        return res.status(400).json({
                            err: "Department not available.",
                        });
                    } else {
                        Staff.find({
                            department: ObjectId(result._id),
                            session: ObjectId(fields.session)
                        })
                        .select('_id firstname lastname email gender phone')
                        .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in fetching staff list. Please try again.",
                                });
                            } else if ( ! result) {
                                return res.status(400).json({
                                    err: "Teacher not available.",
                                });
                            } else {
                                var output = [];
                                asyncLoop(result, function (item, next) { // It will be executed one by one
                                    ClassTimeTable
                                    .find({ school: req.params.schoolID, staff: ObjectId(item._id), is_deleted: 'N' })
                                    .populate({
                                        path: 'period_id',
                                    })
                                    .sort({ createdAt: -1 })
                                    .exec((err,result) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in fetching timetable. Please try again.",
                                            });
                                        } else {
                                            output.push({ ...item.toObject(), occupy: result });
                                            next();
                                        }
                                    });
                                }, function (err) {
                                    res.status(200).json(output);
                                });
                            }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            err: "Can't Able To fetch student list",
        });
    }
};


exports.PeriodMasterList = (req, res) => {
    try {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, (err, fields, file) => {
            var rules = {
                section: 'required',
                class: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                PeriodMaster
                .find({ school: req.params.schoolID, is_deleted: 'N', section: ObjectId(fields.section), class: ObjectId(fields.class) })
                .populate({
                    path: 'period_id',
                })
                .populate('staff', '_id firstname lastname')
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    res.status(200).json(result);
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            err: "Can't Able To fetch student list",
        });
    }
};

