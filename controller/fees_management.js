//import all require dependencies
const formidable = require("formidable");

//import require models
const FeesManagement = require("../model/fees_management");
const FeesSubManagement = require("../model/fees_sub_management");
const common = require("../config/common");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.updateFees = (req, res) => {
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
                class: 'required',
                fees_type: 'required|in:one_time,reoccuring',
                session: 'required',
                fees_details: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    FeesManagement.findOne({ class: ObjectId(fields.class), fees_type: fields.fees_type, session: ObjectId(fields.session), school: ObjectId(req.params.schoolID) })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding fees. Please try again.",
                                });
                            } else {
                                if ( ! result){
                                    var fees_data = new FeesManagement({
                                        class: fields.class,
                                        fees_type: fields.fees_type,
                                        session: fields.session,
                                        school: req.params.schoolID
                                    });
                                    fees_data.save(function(err,result){
                                        if (err){
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in adding fees. Please try again.",
                                            });
                                        } else {
                                            var fees_management_id = result._id;
                                            asyncLoop(JSON.parse(fields.fees_details), function (item, next) { // It will be executed one by one
                                                var params = {
                                                    name: item.name,
                                                    start_date: item.start_date,
                                                    end_date: item.end_date,
                                                    total_amount: item.total_amount,
                                                    fees_type: item.fees_type
                                                };
                                                update_sub_fees(params, fees_management_id, function(response){
                                                    if (response){
                                                        next();
                                                    } else {
                                                        return res.status(400).json({
                                                            err: "Problem in adding fees. Please try again.",
                                                        });
                                                    }
                                                })
                                            }, function (err) {
                                                FeesSubManagement
                                                    .find({fees_management_id: fees_management_id})
                                                    .exec((err, result) => {
                                                        if (err || ! result){
                                                            return res.status(400).json({
                                                                err: "Problem in adding fees. Please try again.",
                                                            });
                                                        } else {
                                                            return res.status(200).json(result);
                                                        }
                                                    });
                                            });
                                        }
                                    })
                                } else {
                                    var fees_management_id = result._id;
                                    asyncLoop(JSON.parse(fields.fees_details), function (item, next) { // It will be executed one by one
                                        var params = {
                                            name: item.name,
                                            start_date: item.start_date,
                                            end_date: item.end_date,
                                            total_amount: item.total_amount,
                                            fees_type: item.fees_type
                                        };
                                        update_sub_fees(params, fees_management_id, function(response){
                                            console.log(response)
                                            if (response){
                                                next();
                                            } else {
                                                return res.status(400).json({
                                                    err: "Problem in adding fees. Please try again.",
                                                });
                                            }
                                        })
                                    }, function (err) {
                                        FeesSubManagement
                                            .find({fees_management_id: fees_management_id})
                                            .exec((err, result) => {
                                                if (err || ! result){
                                                    return res.status(400).json({
                                                        err: "Problem in adding fees. Please try again.",
                                                    });
                                                } else {
                                                    return res.status(200).json(result);
                                                }
                                            });
                                    });
                                }
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in adding fees. Please try again.",
                    });
                }
            }
        }
    });
};


function update_sub_fees(request_data, fees_id, callback){
    if (request_data._id){
        FeesSubManagement.findOneAndUpdate(
            {_id: ObjectId(request_data._id)},
            { $set: {
                name: request_data.name,
                start_date: request_data.start_date,
                end_date: request_data.end_date,
                total_amount: request_data.total_amount,
                fees_type: request_data.fees_type,
            } },
            {new:true, useFindAndModify: false},
        )
        .sort({ createdAt: -1 })
        .then((result, err) => {
            if (err || ! result) {
                console.log(err)
                callback(false);
            } else {
                callback(true);
            }
        });
    } else {
        var fees_data = new FeesSubManagement({
            fees_management_id: fees_id,
            name: request_data.name,
            start_date: request_data.start_date,
            end_date: request_data.end_date,
            total_amount: request_data.total_amount,
            fees_type: request_data.fees_type,
        });
        fees_data.save(function(err,result){
            if (err || ! result){
                console.log(err);
                callback(false);
            } else{
                callback(true);
            }
        });
    }
}


exports.deleteFees = (req, res) => {
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
                id: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    FeesSubManagement.deleteMany({ _id: ObjectId(fields.id) }, function (err) {
                        if (err) {
                            return res.status(400).json({
                                err: "Can't Able To Delete fees",
                            });
                        }
                        return res.json({
                            Massage: `Deleted SuccessFully`,
                        });
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in adding fees. Please try again.",
                    });
                }
            }
        }
    });
};