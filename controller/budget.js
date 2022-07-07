const formidable = require("formidable");

//import require models
const BudgetManagement = require("../model/budget");
const common = require("../config/common");
const asyncLoop = require('node-async-loop');
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
                    BudgetManagement.find({ school: ObjectId(req.params.schoolID) })
                    .populate('staff', 'firstname lastname gender _id email phone')
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
