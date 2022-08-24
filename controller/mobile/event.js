//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
//import require models
const Event = require("../../model/event");
const common = require("../../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//exports routes controller
exports.getEvent = (req, res) => {
    var rules = {
        _id: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        Event.findOne({ _id: req.body._id })
            .populate("assignTeachers", "_id firstname lastname gender email phone")
            .populate("school", "_id schoolname abbreviation")
            .populate("session", "_id name")
            .then((data, err) => {
                if (err || !data) {
                    if (err) {
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "Can't able to find the Events.", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Event fetched successfully", data);
                }
            });
    }
};

exports.getAllEvent = (req, res) => {
    try {
        var params = { school: ObjectId(req.schooldoc._id) };
        // if (req.body.start_date){
        //     params.event_from = { $gte: new Date(req.body.start_date), $lte: new Date(req.body.end_date) };
        // }
        // if (req.body.end_date){
        //     params.event_to = { $gte: new Date(req.body.start_date), $lte: new Date(req.body.end_date) };
        // }
        // console.log(params)
        //{startDate:{$lte:new Date()}},{endDate:{$gte:new Date()}}
        Event.find({$and:[params]})
        .populate("assignTeachers", "_id firstname lastname gender email phone")
        .populate("school", "_id schoolname abbreviation")
        .populate("session", "_id name")
        .sort({ createdAt: -1 })
            .then((event, err) => {
                if (err || ! event) {
                    if (err) {
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 2, "Event not available", []);
                } else {
                    return common.sendJSONResponse(res, 1, "Events fetched successfully", event);
                }
            });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in fetching events. Please try again.", null);
    }
};

exports.createEvent = (req, res) => {
    var fields = req.body;
    var rules = {
        name: 'required',
        event_from: 'required',
        session: 'required',
        event_to: 'required',
        event_type: 'required',
        school: 'required'
    }
    if (common.checkValidationRulesJson(fields, res, rules, 'M')) {
        try {
            let event = new Event(fields);
            event.save((err, event) => {
                if (err) {
                    console.log(err);
                    return common.sendJSONResponse(res, 0, "Problem in creating events. Please try again.", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Event Created Successfully", event);
                }
            });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in creating events. Please try again.", null);
        }
    }
};

exports.deleteEvent = (req, res) => {
    var rules = {
        _id: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            Event.deleteMany({ _id: ObjectId(req.body._id) }, function (err) {
                if (err) {
                    console.log(err);
                    return common.sendJSONResponse(res, 0, "Problem in deleting event. Please try again.", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Event deleted successfully.", true);
                }
            });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in deleting event. Please try again.", null);
        }
    }
};


exports.updateEvent = (req, res) => {
    var fields = req.body;
    var rules = {
        event_id: 'required',
        name: 'required',
        event_from: 'required',
        session: 'required',
        event_to: 'required',
        event_type: 'required',
        school: 'required'
    }
    if (common.checkValidationRulesJson(fields, res, rules, 'M')) {
        try {
            Event.findOneAndUpdate(
                    {_id: ObjectId(fields.event_id), school: ObjectId(fields.school)},
                    { $set: {
                        name: fields.name,
                        event_from: fields.event_from,
                        session: fields.session,
                        event_to: fields.event_to,
                        event_type: fields.event_type,
                        description: fields.description,
                        assignTeachers: fields.assignTeachers
                    } },
                    { new: true, useFindAndModify: false },
                )
                .sort({ createdAt: -1 })
                .then((result, err) => {
                if (err || !result) {
                    if (err) {
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "Problem in updating event. Please try again.", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Event Updated Successfully", result);
                }
            });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in updating event. Please try again.", null);
        }
    }
};


