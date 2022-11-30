//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const common = require("../../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//import require models
const Timetable = require("../../model/timetable");
const ClassTimeTable = require("../../model/class_time_table");
const PeriodMaster = require("../../model/period_master");
const Student = require("../../model/student");

//exports routes controller

exports.getTimetable = (req, res) => {
    Timetable.findOne({ _id: req.timetable._id })
        .populate("class")
        .populate("section")
        .then((data, err) => {
            if (err || !data) {
                return res.status(400).json({
                    err: "Can't able to find the TimeTable Details",
                });
            } else {
                return res.json(data);
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

exports.timeTableList = (req, res) => {
    var rules = {
        role: 'required|in:STD,STA',
        // section: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            if (req.body.role == 'STD'){
                Student.findOne({
                    _id: ObjectId(req.params.id)
                })
                .sort({ createdAt: -1 })
                .then((timetable, err) => {
                    if (err || !timetable) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in fetching timetable. Please try again.",
                        });
                    } else {
                        var period_ids = [];
                        PeriodMaster
                            .find({ school: req.params.schoolID, is_deleted: 'N', section: ObjectId(timetable.section), class: ObjectId(timetable.class) })
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
                                    if (result.length > 0) {
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
                                            .exec((err, result) => {
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
                    }
                });
            } else {
                ClassTimeTable
                .find({ school: req.params.schoolID, staff: ObjectId("62d1863e05c1d682791f964f"), is_deleted: 'N' })
                .populate({
                    path: 'period_id',
                    
                    populate : {
                        path : 'class section',
                    }
                })
                .populate('staff', '_id firstname lastname SID gender email phone')
                .sort({ createdAt: -1 })
                .exec((err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Problem in fetching timetable. Please try again.",
                        });
                    } else {
                        return res.status(200).json(result);
                    }
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                err: "Can't Able To fetch student list",
            });
        }
    }
};


exports.timeTableListV2 = (req, res) => {
    try {
        var rules = {
            role: 'required|in:STD,STA',
            staff: 'required'
        }
        if (req.body.role == 'STD'){
            var rules = {
                section: 'required',
                class: 'required',
            }
        }
        if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
            var fields = { ...req.body };
            var params = {  school: req.params.schoolID,
                            is_deleted: 'N'
                        };
            if (fields.role == 'STD'){
                params.section = ObjectId(fields.section);
                params.class = ObjectId(fields.class);
            }
            PeriodMaster
            .find()
            .populate({
                path: 'period_id',
            })
            .populate('staff', '_id firstname lastname')
            .populate('class')
            .populate('section')
            .sort({ createdAt: -1 })
            .then((result, err) => {
                result.sort((a,b) => { return new Date('12-12-2022 ' + a.start) - new Date('12-12-2022 ' + b.start) });
                var output = {};
                var days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                    var params = { school: req.params.schoolID, is_deleted: 'N' };
                    if (fields.role == 'STA'){
                        params.staff = ObjectId(fields.staff);
                    }
                    ClassTimeTable
                    .find(params)
                    .populate({
                        select: {'_id': 1, 'firstname': 1, 'lastname': 1},
                        path: 'staff',
                    })
                    .populate('class')
                    .populate('section')
                    .sort({ createdAt: -1 })
                    .exec((err,result_t) => {
                        if (err) {
                            console.log(err);
                            return common.sendJSONResponse(res, 0, "Problem in fetching timetable. Please try again.", null);
                        } else {
                            days.forEach(day => {
                                output[day] = [];
                                result.forEach(re => {
                                    var avail = true;
                                    result_t.forEach(rt => {
                                        if (rt.day == day && rt.period_id.toString() == re._id.toString()){
                                            // output[day].push({...re.toObject(), ...rt.toObject()});
                                            output[day].push({
                                                type: re.type,
                                                _id: re._id,
                                                start: re.start,
                                                end: re.end,
                                                subject: rt.subject,
                                                day: rt.day,
                                                subject_id: rt.subject_id,
                                                class: {
                                                    _id: re.class._id,
                                                    name: re.class.name,
                                                },
                                                section: {
                                                    _id: re.class._id,
                                                    name: re.section.name,
                                                },
                                                meet_link: rt.meet_link !== undefined ? rt.meet_link: "",
                                                staff: {
                                                    _id: rt.staff._id,
                                                    firstname: rt.staff.firstname,
                                                    lastname: rt.staff.lastname,
                                                }
                                            });
                                        }
                                    });
                                    if (avail){
                                        // output[day].push({...re.toObject()});
                                        output[day].push({
                                            type: re.type,
                                            _id: re._id,
                                            start: re.start,
                                            end: re.end,
                                            subject: "",
                                            day: "",
                                            subject_id: "",
                                            meet_link: "",
                                            staff: {},
                                            class: {
                                                _id: re.class._id,
                                                name: re.class.name,
                                            },
                                            section: {
                                                _id: re.class._id,
                                                name: re.section.name,
                                            },
                                        });
                                    }
                                });
                            });
                            return common.sendJSONResponse(res, 1, "Timetable fetched successfully", output);
                        }
                    });
            });
        }
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Can't Able To fetch student list", null);
    }
};
