//import all require dependencies
const formidable = require("formidable");

//import require models
const FeesManagement = require("../model/fees_management");
const FeesSubManagement = require("../model/fees_sub_management");
const PenaltyManagement = require("../model/penalty_management");
const SpecialCaseDiscount = require("../model/special_case_discount");
const AvailFees = require("../model/avail_fees");
const Student = require("../model/student");
const CouponMaster = require("../model/coupon");
const SiblingMaster = require("../model/sibling_master");
const SubSiblingMaster = require("../model/sub_siblings");
const common = require("../config/common");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const pdf = require('html-pdf');
const fs = require("fs");



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
                                    FeesSubManagement.deleteMany({ fees_management_id: ObjectId(fees_management_id) }, function (err) {
                                        if (err) {
                                            return res.status(400).json({
                                                err: "Can't Able To Delete fees",
                                            });
                                        }
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


exports.updateAvailFees = (req, res) => {
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
                type: 'required|in:hostel,transport',
                avail_data: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var error = true;
                    var avail_fees = JSON.parse(fields.avail_data);
                    avail_fees.forEach(result => {
                        if (error && ! result.student){
                            error = false;
                            return res.status(400).json({
                                err: "Student is required",
                            });
                        } else if (error && ! result.total){
                            error = false;
                            return res.status(400).json({
                                err: "Total is required",
                            });
                        } else if (error && ! result.from_date){
                            error = false;
                            return res.status(400).json({
                                err: "From Date is required",
                            });
                        } else if (error && ! result.to_date){
                            error = false;
                            return res.status(400).json({
                                err: "To Date is required",
                            });
                        } else if (error && ! result.amount){
                            error = false;
                            return res.status(400).json({
                                err: "Amount is required",
                            });
                        } else if (error && ! result.avail){
                            error = false;
                            return res.status(400).json({
                                err: "Avail is required",
                            });
                        } else if (error && ! result.class){
                            error = false;
                            return res.status(400).json({
                                err: "Class is required",
                            });
                        } else if (error && ! result.section){
                            error = false;
                            return res.status(400).json({
                                err: "Section is required",
                            });
                        } else if (error && ! result.session){
                            error = false;
                            return res.status(400).json({
                                err: "Session is required",
                            });
                        }
                    })
                    if (error){
                        asyncLoop(avail_fees, function (item, next) { // It will be executed one by one
                            AvailFees
                                .findOne({school: ObjectId(req.params.schoolID), student: ObjectId(item.student), type: fields.type, is_deleted: 'N', session: ObjectId(item.session)})
                                .exec((err, result) => {
                                    if (err){
                                        console.log(err);
                                        return res.status(400).json({
                                            err: "Problem in updating fees. Please try again.",
                                        });
                                    } else {
                                        if (result){
                                            AvailFees.findOneAndUpdate(
                                                {_id: ObjectId(result._id)},
                                                { $set: {
                                                    student: item.student,
                                                    total: item.total,
                                                    from_date: item.from_date,
                                                    to_date: item.to_date,
                                                    amount: item.amount,
                                                    avail: item.avail,
                                                    type: fields.type,
                                                    class: item.class,
                                                    section: item.section,
                                                    session: item.session,
                                                    school: req.params.schoolID,
                                                    is_active: 'Y',
                                                } },
                                                { new: true, useFindAndModify: false },
                                            )
                                                .sort({ createdAt: -1 })
                                                .then((result, err) => {
                                                    if (err || !result) {
                                                        return res.status(400).json({
                                                            err: "Problem in updating fees. Please try again.",
                                                        });
                                                    } else {
                                                        next();
                                                    }
                                                });
                                        } else {
                                            var params = new AvailFees({
                                                student: item.student,
                                                total: item.total,
                                                from_date: item.from_date,
                                                to_date: item.to_date,
                                                amount: item.amount,
                                                avail: item.avail,
                                                type: fields.type,
                                                class: item.class,
                                                section: item.section,
                                                session: item.session,
                                                school: req.params.schoolID,
                                                is_active: 'Y',
                                                is_deleted: 'N',
                                                school: req.params.schoolID
                                            });
                                            params.save(function(err,result){
                                                if (err){
                                                    console.log(err);
                                                    return res.status(400).json({
                                                        err: "Problem in updating fees. Please try again.",
                                                    });
                                                } else {
                                                    next();
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
                        err: "Problem in updating fees data. Please try again.",
                    });
                }
            }
        }
    });
};


exports.getAvailFees = (req, res) => {
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
                type: 'required|in:hostel,transport',
                class: 'required',
                section: 'required',
                session: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    Student.find({ school: ObjectId(req.params.schoolID), class: ObjectId(fields.class), section: ObjectId(fields.section), session: ObjectId(fields.session) })
                        .select('_id firstname lastname email gender phone')
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting avail fees data. Please try again.",
                                });
                            } else {
                                if (result){
                                    FeesManagement.find({ school: ObjectId(req.params.schoolID), class: ObjectId(fields.class), session: ObjectId(fields.session) })
                                        .then((fees_master_data, err) => {
                                            if (err) {
                                                console.log(err);
                                                return res.status(400).json({
                                                    err: "Problem in getting avail fees data. Please try again.",
                                                });
                                            } else {
                                                if ( ! fees_master_data){
                                                    return res.status(400).json({
                                                        err: "Problem in getting avail fees data. Please try again.",
                                                    });
                                                } else {
                                                    var ids = [];
                                                    var name = fields.type == 'hostel' ? 'hostel' : 'transportation';
                                                    fees_master_data.forEach(asd => {
                                                        ids.push(ObjectId(asd._id));
                                                    });
                                                    FeesSubManagement
                                                    .findOne({ fees_management_id: { "$in": ids }, name: name })
                                                    .sort({ createdAt: -1 })
                                                    .exec((err,fees_sub_data) => {
                                                        if (err) {
                                                            console.log(err);
                                                            return res.status(400).json({
                                                                err: "Problem in fetching timetable. Please try again.",
                                                            });
                                                        } else {
                                                            if ( ! fees_sub_data){
                                                                return res.status(400).json({
                                                                    err: "Fees data not available in fees master.",
                                                                });
                                                            } else {
                                                                var output = [];
                                                                if (result.length > 0){
                                                                    asyncLoop(result, function (item, next) { // It will be executed one by one
                                                                        AvailFees
                                                                            .findOne({school: ObjectId(req.params.schoolID), student: ObjectId(item._id)})
                                                                            .exec((err, result_avail) => {
                                                                                if (err){
                                                                                    console.log(err);
                                                                                    return res.status(400).json({
                                                                                        err: "Problem in updating fees. Please try again.",
                                                                                    });
                                                                                } else {
                                                                                    if (fees_sub_data){
                                                                                        output.push({ ...item.toObject(), avail_fees: result_avail !== null ? result_avail: {}, amount: fees_sub_data.total_amount, fees_type: fees_sub_data.fees_type });
                                                                                    } else {
                                                                                        output.push({ ...item.toObject(), avail_fees: {}, amount: 0, fees_type: '' });
                                                                                    }
                                                                                    next();
                                                                                }
                                                                            });
                                                                        }, function (err) {
                                                                            return res.status(200).json(output);
                                                                        });
                                                                } else {
                                                                    return res.status(200).json(output);
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                } else {
                                    return res.status(400).json({
                                        err: "No student is available.",
                                    });
                                }
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        return res.status(400).json({
                            err: "Problem in getting avail fees data. Please try again.",
                        });
                    }
            }
        }
    });
};



exports.updateCoupon = (req, res) => {
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
                name: 'required',
                amount: 'required',
                description: 'required',
                applicable_from: 'required',
                applicable_to: 'required',
                fees_applicable: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    if (fields._id){
                        CouponMaster.findOneAndUpdate(
                            {_id: ObjectId(fields._id)},
                            { $set: {
                                name: fields.name,
                                amount: fields.amount,
                                description: fields.description,
                                applicable_from: fields.applicable_from,
                                applicable_to: fields.applicable_to,
                                fees_applicable: JSON.parse(fields.fees_applicable),
                                is_active: 'Y',
                                is_deleted: 'N',
                                school: req.params.schoolID,
                            } },
                            { new: true, useFindAndModify: false },
                        )
                            .sort({ createdAt: -1 })
                            .then((result, err) => {
                                if (err || !result) {
                                    return res.status(400).json({
                                        err: "Problem in updating coupon. Please try again.",
                                    });
                                }
                                return res.status(200).json(result);
                            });
                    } else {
                        var coupon_data = new CouponMaster({
                            name: fields.name,
                            amount: fields.amount,
                            description: fields.description,
                            applicable_from: fields.applicable_from,
                            applicable_to: fields.applicable_to,
                            fees_applicable: JSON.parse(fields.fees_applicable),
                            is_active: 'Y',
                            is_deleted: 'N',
                            school: req.params.schoolID,
                        });
                        coupon_data.save(function(err,result){
                            if (err){
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding coupon. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating coupon. Please try again.",
                    });
                }
            }
        }
    });
}


exports.couponList = (req, res) => {
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
                    CouponMaster.find({ school: ObjectId(req.params.schoolID), is_active: 'Y', is_deleted: 'N' })
                        .populate('fees_applicable')
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting coupon list. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting coupon list. Please try again.", 
                    });
                }
            }
        }
    });
}



exports.removeCoupon = (req, res) => {
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
                _id: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    CouponMaster.findOneAndUpdate(
                        {_id: ObjectId(fields._id)},
                        { $set: {
                            is_active: 'N',
                            is_deleted: 'Y',
                        } },
                        { new: true, useFindAndModify: false },
                    )
                    .sort({ createdAt: -1 })
                    .then((result, err) => {
                        if (err || !result) {
                            return res.status(400).json({
                                err: "Problem in deleting coupon. Please try again.",
                            });
                        }
                        return res.status(200).json({status: true});
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in deleting coupon. Please try again.",
                    });
                }
            }
        }
    });
}


exports.generateReceipt = (req, res) => {
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
                _id: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    Student.findOne({_id: ObjectId(fields._id)})
                    .populate('school')
                    .populate('class')
                    .populate('section')
                    .then(async (result, err) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({
                                err: "Problem in checking student data. Please try again.",
                            });
                        } else {
                            var photo = await common.getFileStream(result.photo);
                            var school_logo = await common.getFileStream(result.school.photo);
                            var html = `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>Document</title>
                                </head>
                                <body style="display: flex;align-items: center;justify-content: center;height: 100vh;margin: 0;">
                                    <div style="border: 5px solid black;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';box-sizing: border-box;padding:0;margin: 0;width: 950px;">
                                        <div style="display:flex;align-items: center;border-bottom: 5px solid black;padding: 0;margin: 0;box-sizing: border-box;">
                                            <div style="width: 80px;height: 60px;">
                                                <img style="width: 100%; height:100%" src="${school_logo}" alt="logo"/>
                                            </div>
                                            <div style="flex:1 1;padding: 0;box-sizing: border-box;margin: 0;">
                                                <h2 style="text-align: center;">Saini International School Pvt.Ltd.</h2>
                                            </div>
                                        </div>
                                        <div style="border-bottom: 5px solid black;">
                                            <p style="text-align: center;padding: 0.5rem;margin: 0;box-sizing: border-box; font-weight: 700;font-size: 20px;">${result.school.address}, ${result.school.pincode}</p>
                                        </div>
                                        <div style="border-bottom: 5px solid black;">
                                            <p style="text-align: center;padding: 0.5rem;margin: 0;box-sizing: border-box; font-weight: 700;font-size: 18px;text-transform: uppercase;">Fees Receipt for the month : september-2020</p>
                                        </div>
                                        <div style="display: flex;border-bottom: 3px solid black;">
                                            <div style="flex :1 1;border-right: 2.5px solid black;padding: 0.5rem 0;">
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Student Name : </span>
                                                    <span style="font-size: 22px;">${result.firstname} ${result.lastname}</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Father's Name : </span>
                                                    <span style="font-size: 22px;">${result.guardian_name !== undefined ? result.guardian_name : result.result.father_name}</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Class : </span>
                                                    <span style="font-size: 22px;">${result.class.name}</span>
                                                </div>
                                                <!-- <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Bank Name : </span>
                                                    <span style="font-size: 22px;">SBI</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Pan No. : </span>
                                                    <span style="font-size: 22px;">ADSE23472A</span>
                                                </div> -->
                                            </div>
                                            <div style="flex :1 1;border-left: 2.5px solid black;padding: 0.5rem 0;">
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Student ID : </span>
                                                    <span style="font-size: 22px;">${result.SID}</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Date of Birth : </span>
                                                    <span style="font-size: 22px;">${result.date_of_birth.getDate()}/${result.date_of_birth.getMonth() + 1}/${result.date_of_birth.getFullYear()} </span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Section : </span>
                                                    <span style="font-size: 22px;">${result.section.name}</span>
                                                </div>
                                                <!-- <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Pay Mode : </span>
                                                    <span style="font-size: 22px;">A/C TRN</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">A/C No. : </span>
                                                    <span style="font-size: 22px;">ADSE23472A</span>
                                                </div> -->
                                            </div>
                                        </div>
                                        <!-- <div style="display: flex;justify-content:space-around;border-bottom:2.5px solid black;padding: 0.5rem;">
                                            <span style="font-weight: 500;font-size:20px;">Month Days : 30</span>
                                            <span style="font-weight: 500;font-size:20px;">Lop Days : 0</span>
                                            <span style="font-weight: 500;font-size:20px;">Pay days : 30</span>
                                        </div> -->
                                        <!-- <div style="display: flex;">
                                        <div style="flex :1 1;border-right: 2.5px solid black;padding: 0.5rem 0;border-bottom: 3px solid black;"></div>
                                        <div style="flex :1 1;border-left: 2.5px solid black;padding: 0.5rem 0;border-bottom: 3px solid black;">
                                                <span style="font-size: 22px;font-weight:500;text-transform: uppercase;padding-left: 0.5rem;">Deductions</span>
                                            </div>
                                        </div> -->
                                        <div style="display: flex;">
                                            <div style="flex :1 1;border-right:none;padding: 0.5rem 0;">
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Tuition Fees :  </span>
                                                    <span style="font-size: 22px;">Rs. 20,000</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Hostel Fees : </span>
                                                    <span style="font-size: 22px;">Rs. 1,000</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Transportation Fees : </span>
                                                    <span style="font-size: 22px;">Rs. 0</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Admission Fees : </span>
                                                    <span style="font-size: 22px;">Rs. 21,000</span>
                                                </div>
                                            </div>
                                            <div style="flex :1 1;border-left: none;padding: 0.5rem 0;">
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Development Fees : </span>
                                                    <span style="font-size: 22px;">Rs. 200</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Other : </span>
                                                    <span style="font-size: 22px;">Rs. 0</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;visibility: hidden;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">(its hidden)</span>
                                                    <span style="font-size: 22px;">(its hidden)</span>
                                                </div>
                                                <div style="display: flex;justify-content:space-between;padding:0 0.5rem;visibility: hidden;">
                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">(its hidden) </span>
                                                    <span style="font-size: 22px;">(its hidden)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style="display: flex;">
                                            <div style="display: flex;justify-content:space-between;padding:0 0.5rem;border-top: 3px solid black;flex:1 1;border-right:2px solid black;padding: 0.3rem 0.5rem;">
                                                <span style="font-size: 18px;font-weight:500;text-transform: uppercase;">Penalty :</span>
                                                <span style="font-size: 18px;">Rs. 21,000</span>
                                            </div>
                                            <div style="display: flex;justify-content:space-between;padding:0 0.5rem;border-top: 3px solid black;flex:1 1;border-left:2px solid black;border-right:2px solid black;padding: 0.3rem 0.5rem;">
                                                <span style="font-size: 18px;font-weight:500;text-transform: uppercase;">Coupon discount :</span>
                                                <span style="font-size: 18px;">Rs. 20800</span>
                                            </div>
                                            <div style="display: flex;justify-content:space-between;padding:0 0.5rem;border-top: 3px solid black;flex:1 1;border-left:2px solid black;padding: 0.3rem 0.5rem;">
                                                <span style="font-size: 18px;font-weight:500;text-transform: uppercase;">Sibling discount :</span>
                                                <span style="font-size: 18px;">Rs. 20800</span>
                                            </div>
                                        </div>
                                        <div style="display: flex;">
                                            <div style="display: flex;justify-content:space-between;padding:0 0.5rem;border-top: 3px solid black;flex:1 1;border-right: 2.5px solid black;">
                                                <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Date :</span>
                                                <span style="font-size: 22px;">06-Nov-2022</span>
                                            </div>
                                            <div style="display: flex;justify-content:space-between;padding:0 0.5rem;border-top: 3px solid black;flex:1 1;border-left: 2.5px solid black;">
                                                <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Total Fees :</span>
                                                <span style="font-size: 22px;">Rs. 20800</span>
                                            </div>
                                        </div>
                                    </div>
                                </body>
                                </html>
                            `;
                            var pdfFilePath = `./pdf/${fields._id}.pdf`;
                            var options = { format: 'A4' };

                            pdf.create(html, options).toFile(pdfFilePath, function(err, res2) {
                                if (err){
                                    console.log(err);
                                    res.status(500).send("Some kind of error...");
                                    return;
                                }
                                fs.readFile(pdfFilePath , function (err,data){
                                    res.contentType("application/pdf");
                                    res.send(data);
                                });
                            });
                        }
                    })
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in deleting coupon. Please try again.",
                    });
                }
            }
        }
    });
}


exports.updateSibling = (req, res) => {
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
                name: 'required',
                no_of_students: 'required',
                session: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    SiblingMaster
                    .findOne({school: ObjectId(req.params.schoolID), name: fields.name, is_deleted: 'N'})
                    .exec((err, result) => {
                        if (err){
                            console.log(err);
                            return res.status(400).json({
                                err: "Problem in updating fees. Please try again.",
                            });
                        } else {
                            if (result){
                                SiblingMaster.findOneAndUpdate(
                                    {_id: ObjectId(result._id)},
                                    { $set: {
                                        name: fields.name,
                                        no_of_students: fields.no_of_students,
                                        session: fields.session,
                                    } },
                                    { new: true, useFindAndModify: false },
                                )
                                .sort({ createdAt: -1 })
                                .then((result, err) => {
                                    if (err || !result) {
                                        return res.status(400).json({
                                            err: "Problem in updating sibling. Please try again.",
                                        });
                                    } else {
                                        return res.status(200).json(result);
                                        }
                                });
                            } else {
                                var params = new SiblingMaster({
                                    name: fields.name,
                                    session: fields.session,
                                    no_of_students: fields.no_of_students,
                                    updated_by: req.params.id,
                                    is_active: 'Y',
                                    is_deleted: 'N',
                                    school: req.params.schoolID
                                });
                                params.save(function(err,result){
                                    if (err){
                                        console.log(err);
                                        return res.status(400).json({
                                            err: "Problem in updating sibling. Please try again.",
                                        });
                                    } else {
                                        return res.status(200).json(result);
                                    }
                                });
                            }
                        }
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating sibling data. Please try again.",
                    });
                }
            }
        }
    });
};


exports.updateSubSibling = (req, res) => {
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
                data: 'required',
                sibling_id: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var error = true;
                    var sub_sibling_data = JSON.parse(fields.data);
                    sub_sibling_data.forEach(result => {
                        if (error && ! result.class){
                            error = false;
                            return res.status(400).json({
                                err: "Class is required",
                            });
                        } else if (error && ! result.section){
                            error = false;
                            return res.status(400).json({
                                err: "Section is required",
                            });
                        } else if (error && ! result.student){
                            error = false;
                            return res.status(400).json({
                                err: "Student is required",
                            });
                        } else if (error && ! result.rate){
                            error = false;
                            return res.status(400).json({
                                err: "Rate is required",
                            });
                        } else if (error && ! result.type){
                            error = false;
                            return res.status(400).json({
                                err: "Type is required",
                            });
                        }
                    })
                    if (error){
                        asyncLoop(sub_sibling_data, function (item, next) { // It will be executed one by one
                            if (item._id){
                                SubSiblingMaster.findOneAndUpdate(
                                    {_id: ObjectId(item._id)},
                                    { $set: {
                                        class: item.class,
                                        section: item.section,
                                        sibling: fields.sibling_id,
                                        student: item.student,
                                        rate: item.rate,
                                        type: item.type,
                                        updated_by: req.params.id,
                                        is_active: 'Y',
                                        is_deleted: 'N'
                                    } },
                                    { new: true, useFindAndModify: false },
                                )
                                    .sort({ createdAt: -1 })
                                    .then((result, err) => {
                                        if (err || !result) {
                                            return res.status(400).json({
                                                err: "Problem in updating sibling data. Please try again.",
                                            });
                                        } else {
                                            next();
                                        }
                                    });
                            } else {
                                var params = new SubSiblingMaster({
                                    class: item.class,
                                    section: item.section,
                                    sibling: fields.sibling_id,
                                    student: item.student,
                                    rate: item.rate,
                                    type: item.type,
                                    updated_by: req.params.id,
                                    is_active: 'Y',
                                    is_deleted: 'N'
                                });
                                params.save(function(err,result){
                                    if (err){
                                        console.log(err);
                                        return res.status(400).json({
                                            err: "Problem in updating sibling data. Please try again.",
                                        });
                                    } else {
                                        next();
                                    }
                                });
                            }
                        }, function (err) {
                            return res.status(200).json({status: true});
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating sibling data. Please try again.",
                    });
                }
            }
        }
    });
};


exports.getSiblingMaster = (req, res) => {
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
                    SiblingMaster.find({ school: ObjectId(req.params.schoolID), is_active: 'Y', is_deleted: 'N' })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting sibling master list. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting sibling master list. Please try again.",
                    });
                }
            }
        }
    });
}



exports.getSiblingStudent = (req, res) => {
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
                sibling_id: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    SubSiblingMaster.find({ sibling: ObjectId(fields.sibling_id), is_deleted: 'N' })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in getting sibling master list. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in getting sibling master list. Please try again.",
                    });
                }
            }
        }
    });
}


