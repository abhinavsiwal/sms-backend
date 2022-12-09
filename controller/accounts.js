const formidable = require("formidable");
const _ = require("lodash");
const LinkStudentSalary = require("../model/link_student_salary");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const common = require("../config/common");


exports.LinkSalaryWithStudent = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        }
        var rules = {
            link_data: 'required'
        }
        if (common.checkValidationRulesJson(fields, res, rules)) {
            LinkStudentSalary.updateMany({ "staff": req.params.id }, { "$set": { "is_active": 'N', "is_deleted": 'Y' } }, { "multi": true }, function (error, result_u) {
                if (error) {
                    console.log(error)
                    callback(null, lang[language]['error']['patient_reading_update_failed'], '0');
                } else {
                    if (JSON.parse(fields.link_data).length > 0){
                        asyncLoop(JSON.parse(fields.link_data), async function (item, next) { // It will be executed one by one
                            var link_data = await LinkStudentSalary.findOne({staff: ObjectId(req.params.id), student: ObjectId(item.student), school: ObjectId(fields.school) });
                            if ( ! link_data){
                                var link_student = new LinkStudentSalary({
                                    class: item.class,
                                    section: item.section,
                                    student: item.student,
                                    staff: req.params.id,
                                    one_time: item.one_time,
                                    recurring: item.recurring,
                                    school: req.params.schoolID,
                                    updatedBy: req.params.id,
                                    is_active: 'Y',
                                    is_deleted: 'N'
                                });
                                link_student.save(function(err,result){
                                    if (err || ! result){
                                        if (err){
                                            console.log(err);
                                        }
                                        return res.status(400).json({
                                            err: "Problem in linking salary with student. Please try again.",
                                        });
                                    } else{
                                        next();
                                    }
                                });
                            } else {
                                await LinkStudentSalary.findOneAndUpdate(
                                    { _id: link_data._id },
                                    { $set: { one_time: item.one_time, recurring: item.recurring, is_active: 'Y', is_deleted: 'N', updated_by: req.params.id } },
                                    { new: true, useFindAndModify: false },
                                );
                                next();
                            }
                        }, async function (err) {
                            var link_student_list = await LinkStudentSalary.find({staff: ObjectId(req.params.id), is_active: 'Y', is_deleted: 'N'});
                            return res.status(200).json(link_student_list);
                        });
                    } else {
                        return res.status(200).json([]);
                    }
                }
            });
        }
    });
};

exports.LinkSalaryWithStudentList = async (req, res) => {
    LinkStudentSalary.find({staff: ObjectId(req.params.id), 'is_deleted': 'N', is_active: 'Y'})
    .populate("student", "_id firstname lastname gender session email phone")
    .populate("staff", "_id firstname lastname gender email phone")
    .populate("class", "_id name abbreviation")
    .populate("school", "_id schoolname address city state")
    .populate("section", "_id name abbreviation")
    .exec(function(err, result){
        if (err){
            console.log(err);
        } else {
            res.status(200).json(result);
        }
    })
}
