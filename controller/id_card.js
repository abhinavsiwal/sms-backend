//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const IdCard = require("../model/id_card");
const common = require("../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;


exports.updateIdCard = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        var rules = {
            name: 'required',
            address: 'required',
            contact_no: 'required',
            school: 'required',
        }
        if (common.checkValidationRulesJson(fields, res, rules)) {
            try {
                IdCard.findOne( { school: ObjectId(fields.school) },
                    (err, data) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).json({
                            err: "Please Check Data!",
                            });
                        } else if (data) {
                            IdCard.findOneAndUpdate(
                                {_id: ObjectId(data._id)},
                                { $set: fields },
                                {new:true, useFindAndModify: false},
                            )
                            .sort({ createdAt: -1 })
                            .then((result, err) => {
                                if (err || ! result) {
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Problem in updating id card details. Please try again.",
                                    });
                                } else {
                                    return res.status(200).json(result);
                                }
                            });
                        } else {
                            var budget_data = new IdCard({
                                name: fields.name,
                                address: fields.address,
                                contact_no: fields.contact_no,
                                color_1: fields.color_1,
                                color_2: fields.color_2,
                                school: req.params.schoolID
                            });
                            budget_data.save(function(err,result){
                                if (err){
                                    console.log(err);
                                    return res.status(400).json({
                                        err: "Problem in adding id card details. Please try again.",
                                    });
                                } else {
                                    return res.status(200).json(result);
                                }
                            })
                        }
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    err: "Problem in updating id card details. Please try again.",
                });
            }
        }
    });
};


exports.getIdCard = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        try {
            IdCard.findOne( { school: ObjectId(req.params.schoolID) },
                (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).json({
                            err: "Please Check Data!",
                        });
                    } else if (data) {
                        return res.status(200).json(data);
                    } else {
                        return res.status(400).json({
                            err: "ID card details not available.",
                        });
                    }
            });
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                err: "ID card details not available.",
            });
        }
    });
};

