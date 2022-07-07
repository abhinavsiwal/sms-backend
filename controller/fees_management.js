//import all require dependencies
const formidable = require("formidable");

//import require models
const FeesManagement = require("../model/fees_management");
const FeesSubManagement = require("../model/fees_sub_management");
const PenaltyManagement = require("../model/penalty_management");
const SpecialCaseDiscount = require("../model/special_case_discount");
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
    // if (request_data._id){
    //     FeesSubManagement.findOneAndUpdate(
    //         {_id: ObjectId(request_data._id)},
    //         { $set: {
    //             name: request_data.name,
    //             start_date: request_data.start_date,
    //             end_date: request_data.end_date,
    //             total_amount: request_data.total_amount,
    //             fees_type: request_data.fees_type,
    //         } },
    //         {new:true, useFindAndModify: false},
    //     )
    //     .sort({ createdAt: -1 })
    //     .then((result, err) => {
    //         if (err || ! result) {
    //             console.log(err)
    //             callback(false);
    //         } else {
    //             callback(true);
    //         }
    //     });
    // } else {
        FeesSubManagement.deleteMany({ fees_management_id: ObjectId(fees_id) }, function (err) {
            if (err) {
                return res.status(400).json({
                    err: "Can't Able To Delete fees",
                });
            }
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
        });
    // }
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


exports.getFees = (req, res) => {
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
                session: 'required',
                class: 'required',
                fees_type: 'required|in:one_time,reoccuring',
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
                                if (result){
                                    FeesSubManagement
                                        .find({fees_management_id: ObjectId(result._id)})
                                        .exec((err, result) => {
                                            if (err || ! result){
                                                return res.status(400).json({
                                                    err: "Fees data not available.",
                                                });
                                            } else {
                                                return res.status(200).json(result);
                                            }
                                        });
                                } else {
                                    return res.status(400).json({
                                        err: "Fees data not available.",
                                    });
                                }
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in fetching fees details. Please try again.",
                    });
                }
            }
        }
    });
};


exports.feesTypeList = (req, res) => {
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
                session: 'required',
                class: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    FeesManagement.find({ class: ObjectId(fields.class), session: ObjectId(fields.session), school: ObjectId(req.params.schoolID) })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding fees. Please try again.",
                                });
                            } else {
                                if (result){
                                    var output = [];
                                    asyncLoop(result, function (item, next) { // It will be executed one by one
                                        FeesSubManagement
                                            .find({fees_management_id: ObjectId(item._id)})
                                            .exec((err, sub_result) => {
                                                if (err){
                                                    console.log(error);
                                                    return res.status(400).json({
                                                        err: "Fees data not available.",
                                                    });
                                                } else {
                                                    if (result){
                                                        output = [ ...output, ...sub_result]
                                                    }
                                                    next();
                                                }
                                            });
                                        }, function (err) {
                                            return res.status(200).json(output);
                                        });
                                } else {
                                    return res.status(400).json({
                                        err: "Fees data not available.",
                                    });
                                }
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        return res.status(400).json({
                            err: "Problem in fetching fees details. Please try again.",
                        });
                    }
                }
            }
        });
};


exports.updatePenalty = (req, res) => {
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
                sub_fees_management_id: 'required',
                penalty_charges: 'required',
                applicable_date: 'required',
                penalty_rate: 'required|in:percentage,flat_rate',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    if (fields._id){
                        PenaltyManagement.findOneAndUpdate(
                            {_id: ObjectId(fields._id)},
                            { $set: {
                                sub_fees_management_id: JSON.parse(fields.sub_fees_management_id),
                                penalty_charges: fields.penalty_charges,
                                applicable_date: fields.applicable_date,
                                school: req.params.schoolID,
                                penalty_rate: fields.penalty_rate,
                            } },
                            { new: true, useFindAndModify: false },
                        )
                            .sort({ createdAt: -1 })
                            .then((result, err) => {
                                if (err || !result) {
                                    return res.status(400).json({
                                        err: "Database Don't Have Allocated Room",
                                    });
                                }
                                return res.status(200).json(result);
                            });
                    } else {
                        var penalty_data = new PenaltyManagement({
                            sub_fees_management_id: JSON.parse(fields.sub_fees_management_id),
                            penalty_charges: fields.penalty_charges,
                            applicable_date: fields.applicable_date,
                            school: req.params.schoolID,
                            penalty_rate: fields.penalty_rate,
                        });
                        penalty_data.save(function(err,result){
                            if (err){
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding penalty. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in adding fees. Please try again.",
                    });
                }
            }
        }
    });
}


exports.penaltyList = (req, res) => {
    try {
        PenaltyManagement.find({ school: ObjectId(req.params.schoolID) })
            .populate("sub_fees_management_id")
            .then((result, err) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        err: "Problem in fetching penalty details. Please try again.",
                    });
                } else {
                    if (result){
                        return res.status(200).json(result);
                    } else {
                        return res.status(400).json({
                            err: "Penalty data not available.",
                        });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                err: "Problem in fetching penalty details. Please try again.",
            });
        }
};


exports.deletePenalty = (req, res) => {
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
                    PenaltyManagement.deleteMany({ _id: ObjectId(fields.id) }, function (err) {
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


exports.updateSpecialDiscount = (req, res) => {
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
                student: 'required',
                section: 'required',
                description: 'required',
                managed_by: 'required|in:school_management,donator',
                session: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    SpecialCaseDiscount.findOne({ class: ObjectId(fields.class), student: fields.student, session: ObjectId(fields.session), school: ObjectId(req.params.schoolID) })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in updating special case discount. Please try again.",
                                });
                            } else {
                                if ( ! result){
                                    var special_case_discount = new SpecialCaseDiscount({
                                        class: fields.class,
                                        student: fields.student,
                                        section: fields.section,
                                        description: fields.description,
                                        managed_by: fields.managed_by,
                                        session: fields.session,
                                        school: req.params.schoolID
                                    });
                                    special_case_discount.save(function(err,result){
                                        if (err){
                                            console.log(err);
                                            return res.status(400).json({
                                                err: "Problem in updating special case discount. Please try again.",
                                            });
                                        } else {
                                            return res.status(200).json(result);
                                        }
                                    })
                                } else {
                                    SpecialCaseDiscount.findOneAndUpdate(
                                        {_id: ObjectId(result._id)},
                                        { $set: {
                                            class: fields.class,
                                            student: fields.student,
                                            section: fields.section,
                                            description: fields.description,
                                            managed_by: fields.managed_by,
                                            session: fields.session,
                                            school: req.params.schoolID
                                        } },
                                        { new: true, useFindAndModify: false },
                                    )
                                        .sort({ createdAt: -1 })
                                        .then((result, err) => {
                                            if (err || !result) {
                                                console.log(err)
                                                return res.status(400).json({
                                                    err: "Problem in updating special case discount. Please try again.",
                                                });
                                            }
                                            return res.status(200).json(result);
                                        });
                                }
                            }
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating special case discount. Please try again.",
                    });
                }
            }
        }
    });
}


exports.deleteSpecialDiscount = (req, res) => {
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
                    SpecialCaseDiscount.deleteMany({ _id: ObjectId(fields.id) }, function (err) {
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


exports.getSpecialDiscount = (req, res) => {
    try {
        SpecialCaseDiscount.find({ school: ObjectId(req.params.schoolID) })
            .populate("class", "_id name abbreviation")
            .populate('student', '_id firstname lastname gender')
            .populate("section", "_id name abbreviation")
            .populate("session", "_id name year")
            .then((result, err) => {
                if (err) {
                    console.log(err);
                    return res.status(400).json({
                        err: "Problem in fetching special case discount. Please try again.",
                    });
                } else {
                    if (result){
                        return res.status(200).json(result);
                    } else {
                        return res.status(400).json({
                            err: "Special case discount data not available.",
                        });
                    }
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                err: "Problem in fetching special case discount. Please try again.",
            });
        }
};
