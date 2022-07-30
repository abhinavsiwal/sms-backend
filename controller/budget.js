const formidable = require("formidable");

//import require models
const BudgetManagement = require("../model/budget");
const DepartmentBudgetManagement = require("../model/department_budget");
const UsedBudget = require("../model/budget_used_details");
const common = require("../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.updateBudget = (req, res) => {
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
                staff: 'required',
                session: 'required',
                allocated: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    if ( ! fields._id){
                        var budget_data = new BudgetManagement({
                            staff: fields.staff,
                            session: fields.session,
                            allocated: fields.allocated,
                            school: req.params.schoolID,
                            updatedBy: req.params.id,
                            is_active: 'Y',
                            is_deleted: 'N'
                        });
                        budget_data.save(function(err,result){
                            if (err){
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding budget. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        })
                    } else {
                        BudgetManagement.findOneAndUpdate(
                            {_id: ObjectId(fields._id)},
                            { $set: {
                                staff: fields.staff,
                                session: fields.session,
                                allocated: fields.allocated,
                                school: req.params.schoolID,
                                updatedBy: req.params.id,
                            } },
                            {new:true, useFindAndModify: false},
                        )
                        .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err || ! result) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in updating budget. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in allocating budget. Please try again.",
                    });
                }
            }
        }
    });
};


exports.allocationList = (req, res) => {
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
                    BudgetManagement.find({ school: ObjectId(req.params.schoolID), is_deleted: 'N' })
                    .populate({
                        path: "staff",
                        populate: {
                            path: "department",
                            select: "_id name"
                        },
                        select: "firstname lastname gender _id email phone"
                    })
                    .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding fees. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
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


exports.updateDepartmentBudget = (req, res) => {
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
                department: 'required',
                session: 'required',
                allocated: 'required',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    if ( ! fields._id){
                        var budget_data = new DepartmentBudgetManagement({
                            department: fields.department,
                            session: fields.session,
                            allocated: fields.allocated,
                            school: req.params.schoolID,
                            updatedBy: req.params.id,
                            is_active: 'Y',
                            is_deleted: 'N'
                        });
                        budget_data.save(function(err,result){
                            if (err){
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding budget. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        })
                    } else {
                        DepartmentBudgetManagement.findOneAndUpdate(
                            {_id: ObjectId(fields._id)},
                            { $set: {
                                staff: fields.staff,
                                session: fields.session,
                                allocated: fields.allocated,
                                school: req.params.schoolID,
                                updatedBy: req.params.id
                            } },
                            {new:true, useFindAndModify: false},
                        )
                        .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err || ! result) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in updating budget. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in allocating budget. Please try again.",
                    });
                }
            }
        }
    });
};


exports.departmentBudgetList = (req, res) => {
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
                    DepartmentBudgetManagement.find({ school: ObjectId(req.params.schoolID), is_deleted: 'N' })
                    .populate('department')
                    .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in fetching budget details. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        return res.status(400).json({
                            err: "Problem in fetching budget details. Please try again.",
                        });
                    }
                }
            }
        });
};


exports.usedBudgetUpdate = (req, res) => {
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
                event_name: 'required',
                department: 'required',
                staff: 'required',
                description: 'required',
                used_by: 'required',
                confirm_by: 'required',
                session: 'required',
                advance: 'required',
                used_amount: 'required',
                amount_paid: 'required',
                amount_collected: 'required',
                bill_type: 'required|in:yes,no',
                reimburse: 'required|in:yes,no',
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    if ( ! fields._id){
                        var budget_data = new UsedBudget({
                            event_name: fields.event_name,
                            department: fields.department,
                            staff: fields.staff,
                            description: fields.description,
                            used_by: fields.used_by,
                            confirm_by: fields.confirm_by,
                            session: fields.session,
                            advance: fields.advance,
                            used_amount: fields.used_amount,
                            amount_paid: fields.amount_paid,
                            amount_collected: fields.amount_collected,
                            bill_type: fields.bill_type,
                            document_name: fields.document_name,
                            reimburse: fields.reimburse,
                            school: req.params.schoolID,
                            updatedBy: req.params.id,
                        });
                        budget_data.save(function(err,result){
                            if (err){
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in adding budget. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        })
                    } else {
                        UsedBudget.findOneAndUpdate(
                            {_id: ObjectId(fields._id)},
                            { $set: {
                                event_name: fields.event_name,
                                department: fields.department,
                                staff: fields.staff,
                                description: fields.description,
                                used_by: fields.used_by,
                                confirm_by: fields.confirm_by,
                                session: fields.session,
                                advance: fields.advance,
                                used_amount: fields.used_amount,
                                amount_paid: fields.amount_paid,
                                amount_collected: fields.amount_collected,
                                bill_type: fields.bill_type,
                                document_name: fields.document_name,
                                reimburse: fields.reimburse,
                                school: req.params.schoolID,
                                updatedBy: req.params.id,
                            } },
                            {new:true, useFindAndModify: false},
                        )
                        .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err || ! result) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in updating budget. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in updating budget. Please try again.",
                    });
                }
            }
        }
    });
};


exports.usedBudgetList = (req, res) => {
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
                    UsedBudget.find({ school: ObjectId(req.params.schoolID) })
                    .populate('department')
                    .populate('staff', 'firstname lastname gender _id email phone')
                    .populate('used_by', 'firstname lastname gender _id email phone')
                    .populate("session", "_id name year")
                    .populate('confirm_by', 'firstname lastname gender _id email phone')
                    .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err) {
                                console.log(err);
                                return res.status(400).json({
                                    err: "Problem in fetching budget details. Please try again.",
                                });
                            } else {
                                return res.status(200).json(result);
                            }
                        });
                    } catch (error) {
                        console.log(error);
                        return res.status(400).json({
                            err: "Problem in fetching budget details. Please try again.",
                        });
                    }
                }
            }
        });
};

exports.deleteBudget = (req, res) => {
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
                budget_id: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                BudgetManagement.findOneAndUpdate(
                    {_id: ObjectId(fields.budget_id)},
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


exports.deleteDepartmentBudget = (req, res) => {
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
                budget_id: 'required'
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                DepartmentBudgetManagement.findOneAndUpdate(
                    {_id: ObjectId(fields.budget_id)},
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
                            err: "Problem in deleting department budget. Please try again.",
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