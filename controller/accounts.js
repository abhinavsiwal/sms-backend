const formidable = require("formidable");
const _ = require("lodash");
const LinkStudentSalary = require("../model/link_student_salary");
const Staff = require("../model/staff");
const StaffSalary = require("../model/staff_salary");
const SalaryBreakup = require("../model/salary_breakup");
const StaffAttandance = require("../model/staff_attandance");
const asyncLoop = require('node-async-loop');
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const common = require("../config/common");
const fs = require("fs");
const pdf = require('html-pdf');


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
                    if (JSON.parse(fields.link_data).length > 0) {
                        asyncLoop(JSON.parse(fields.link_data), async function (item, next) { // It will be executed one by one
                            var link_data = await LinkStudentSalary.findOne({ staff: ObjectId(req.params.id), student: ObjectId(item.student), school: ObjectId(fields.school) });
                            if (!link_data) {
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
                                link_student.save(function (err, result) {
                                    if (err || !result) {
                                        if (err) {
                                            console.log(err);
                                        }
                                        return res.status(400).json({
                                            err: "Problem in linking salary with student. Please try again.",
                                        });
                                    } else {
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
                            var link_student_list = await LinkStudentSalary.find({ staff: ObjectId(req.params.id), is_active: 'Y', is_deleted: 'N' });
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
    LinkStudentSalary.find({ staff: ObjectId(req.params.id), 'is_deleted': 'N', is_active: 'Y' })
        .populate("student", "_id firstname lastname gender session email phone")
        .populate("staff", "_id firstname lastname gender email phone")
        .populate("class", "_id name abbreviation")
        .populate("school", "_id schoolname address city state")
        .populate("section", "_id name abbreviation")
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                res.status(200).json(result);
            }
        })
}


exports.staffSalaryGenerate = async (req, res) => {
    Staff.find({ school: ObjectId(req.params.schoolID) })
        .populate('school')
        .populate('department')
        .populate('assign_role')
        .exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                asyncLoop(result, async function (item, next) { // It will be executed one by one
                    var school_logo = await common.getFileStream(item.school.photo);
                    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    var start_date = item.joining_date;
                    var date = new Date();
                    var monthYear = [];
                    do {
                        monthYear.push({
                            month: monthNames[start_date.getMonth()],
                            year: start_date.getFullYear(),
                            monthNo: start_date.getMonth() + 1
                        });
                        start_date.setMonth(start_date.getMonth() + 1);
                    }
                    while (start_date.getMonth() <= date.getMonth() && start_date.getFullYear() <= date.getFullYear())
                    asyncLoop(monthYear, async function (item_new, next_new) { // It will be executed one by one
                        StaffSalary.findOne({
                            month: item_new.month,
                            month_no: item_new.monthNo,
                            staff: ObjectId(item._id),
                            is_deleted: 'N'
                        })
                            .sort({ createdAt: -1 })
                            .then(async (fees_data, err) => {
                                if (err) {
                                    return res.status(400).json({
                                        err: "Database Dont Have Admin",
                                    });
                                } else {
                                    if (!fees_data) {
                                        SalaryBreakup.findOne({
                                            staff: ObjectId(item._id),
                                        }).sort({ updatedAt: -1 })
                                            .then(async (salary_breakup, err) => {
                                                console.log(salary_breakup)

                                                if (err) {
                                                    return res.status(400).json({
                                                        err: "Database Dont Have Admin",
                                                    });
                                                } else {
                                                    if (!salary_breakup) {
                                                        next_new();
                                                    } else {
                                                        var totalDays = getDays(item_new.year, item_new.monthNo);
                                                        var from_date = item_new.year + '-' + item_new.monthNo + '-' + '01';
                                                        var to_date = item_new.year + '-' + item_new.monthNo + '-' + totalDays;
                                                        StaffAttandance.find({
                                                            date: { $gte: from_date + ' 00:00:00', $lte: to_date + ' 23:59:59' },
                                                            attendance_status: { $in: ['L', 'HL'] }
                                                        }).sort({ createdAt: -1 })
                                                            .then(async (leave_attandace, err) => {
                                                                if (err) {
                                                                    return res.status(400).json({
                                                                        err: "Database Dont Have Admin",
                                                                    });
                                                                } else {
                                                                    var total_leaves = 0;
                                                                    if (leave_attandace.length > 0) {
                                                                        leave_attandace.forEach(r =>{
                                                                            if (r.attendance_status == 'L') {
                                                                                total_leaves += 1;
                                                                            } else if (r.attendance_status == 'HL') {
                                                                                total_leaves += 0.5;
                                                                            }
                                                                        })
                                                                    }
                                                                    var per_day_salary = salary_breakup.total_amount / totalDays;
                                                                    var total_amount = salary_breakup.total_amount;
                                                                    var leave_deductions = Math.round(total_leaves * per_day_salary * 100) / 100;
                                                                    var salary_credit = salary_breakup.total_amount - leave_deductions - salary_breakup.professional_tax - salary_breakup.other;
                                                                    var total_deductions = leave_deductions + salary_breakup.professional_tax + salary_breakup.other;
                                                                    var params = {
                                                                        salary_credit: salary_credit,
                                                                        month: item_new.month,
                                                                        month_no: item_new.monthNo,
                                                                        year: item_new.year,
                                                                        total_salary: salary_breakup.total_amount,
                                                                        basic_salary: salary_breakup.basic_salary,
                                                                        lta: salary_breakup.lta,
                                                                        hra: salary_breakup.hra,
                                                                        professional_tax: salary_breakup.professional_tax,
                                                                        others: salary_breakup.other,
                                                                        leave_deductions: leave_deductions,
                                                                        total_leaves: total_leaves,
                                                                        total_deductions: total_deductions,
                                                                        staff: item._id,
                                                                        school: req.params.schoolID,
                                                                        paid: 'Y',
                                                                        is_active: 'Y',
                                                                        is_deleted: 'N'
                                                                    };
                                                                    var salary_breakup_data = new StaffSalary(params);
                                                                    salary_breakup_data.save(function (err, breakup_result) {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            return res.status(400).json({
                                                                                err: "Problem in updating salary data. Please try again.",
                                                                            });
                                                                        } else {

                                                                            var html = `
                                                                                <!DOCTYPE html>
                                                                                <html lang="en">
                                                                                <head>
                                                                                    <meta charset="UTF-8">
                                                                                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                                                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                                                    <title>Document</title>
                                                                                    <style>
                                                                                        *{
                                                                                            box-sizing: border-box;
                                                                                            margin: 0;
                                                                                            padding: 0;
                                                                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
                                                                                        }
                                                                                    </style>
                                                                                </head>
                                                                                <body width="100%" height="100vh">
                                                                                    <table cellspacing='0' width="950px" style="margin: auto;">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td colspan="2">
                                                                                                    <table width="100%" cellspacing="0">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding:0.7rem;border: 5px solid black;border-right: 0;" align="center">
                                                                                                                    <img width="60px" height="60px" src="${school_logo}"/>
                                                                                                                </td>
                                                                                                                <td style="border:collapse;border: 5px solid black;border-left: 0;" align="center">
                                                                                                                    <table width="100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                                <td align="center">
                                                                                                                                    <div style="color: #000;font-weight: 700;font-size: 2.2rem;">${item.school.schoolname}</div>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="border:collapse;border: 5px solid black;border-top: 0;" align="center" colspan="2">
                                                                                                    <h3 style="padding: 0.5rem;">${item.school.address}</h3>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="border:collapse;border: 5px solid black;border-top: 0;" align="center" colspan="2">
                                                                                                    <h3 style="padding: 0.5rem;text-transform: uppercase;">salary slip for the month : ${item_new.month}-${item_new.year}</h3>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="border-bottom: 3px solid black;" colspan="2">
                                                                                                    <table cellspacing="0" width="100%">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td width="50%">
                                                                                                                    <table cellspacing="0" width="100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Employee Name : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;">${item.firstname} ${item.lastname}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Contact Person's Name : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;">${item.contact_person_name}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Role : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;">${item.assign_role.name}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                                <td width="50%">
                                                                                                                    <table cellspacing="0" width="100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Department : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:5px solid black">
                                                                                                                                    <span style="font-size: 22px;">${item.SID}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Date of joining : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:5px solid black">
                                                                                                                                    <span style="font-size: 22px;">${common.formatDate(item.joining_date)}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Department : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:5px solid black">
                                                                                                                                    <span style="font-size: 22px;">${item.department.name}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="border: 5px solid black;border-top:0" colspan="2">
                                                                                                    <table cellspacing="0" width="100%">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td style="padding: 0.3rem;" align="center">
                                                                                                                    <span style="font-weight: 500;font-size:20px;">Month Days : ${totalDays}</span>
                                                                                                                </td>
                                                                                                                <td style="padding: 0.3rem;" align="center">
                                                                                                                    <span style="font-weight: 500;font-size:20px;">Lop Days : ${total_leaves}</span>
                                                                                                                </td>
                                                                                                                <td style="padding: 0.3rem;" align="center">
                                                                                                                    <span style="font-weight: 500;font-size:20px;">Pay days : ${totalDays - total_leaves}</span>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="border-left:5px solid black;border-right: 2.5px solid black ;border-bottom: 3px solid black; width: 50%;padding: 0.3rem;">
                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase; visibility: hidden;">(Hidden)</span>
                                                                                                </td>
                                                                                                <td style="border-bottom: 3px solid black;border-right:5px solid black;border-left:2.5px solid black;width: 50%;padding: 0.3rem;">
                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">DEDUCTIONS </span>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td style="border-bottom: 3px solid black;" colspan="2">
                                                                                                    <table cellspacing="0" width="100%">
                                                                                                        <tbody>
                                                                                                            <tr>
                                                                                                                <td width="50%">
                                                                                                                    <table cellspacing="0" width="100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Basic Salary : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;">Rs. ${breakup_result.basic_salary}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Leave Travel : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;">Rs. ${breakup_result.lta}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">House Rent : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;">Rs. ${breakup_result.hra}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">GROSS SALARY : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;">Rs. ${breakup_result.salary_credit} </span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                                <td width="50%">
                                                                                                                    <table cellspacing="0" width="100%">
                                                                                                                        <tbody>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">PROFESSIONAL TAX : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:5px solid black">
                                                                                                                                    <span style="font-size: 22px;">Rs. ${breakup_result.professional_tax}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">OTHER : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:5px solid black">
                                                                                                                                    <span style="font-size: 22px;">Rs. ${breakup_result.others}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:2.5px solid black;">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;visibility: hidden">(Hidden)</span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:5px solid black">
                                                                                                                                    <span style="visibility: hidden;font-size: 22px;">(Hidden)</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-left:2.5px solid black">
                                                                                                                                    <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">TOTAL DEDUCTIONS : </span>
                                                                                                                                </td>
                                                                                                                                <td style="width:50%;padding: 0.3rem;border-right:5px solid black">
                                                                                                                                    <span style="font-size: 22px;">Rs. ${breakup_result.total_deductions}</span>
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        </tbody>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </body>
                                                                                </html>
                                                                            `;
                                                                            // <!DOCTYPE html>
                                                                            //     <html lang="en">
                                                                            //     <head>
                                                                            //         <meta charset="UTF-8">
                                                                            //         <meta http-equiv="X-UA-Compatible" content="IE=edge">
                                                                            //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                                                            //         <title>Document</title>
                                                                            //     </head>
                                                                            //     <body style="display: flex;align-items: center;justify-content: center;height: 100vh;margin: 0;">
                                                                            //         <div style="border: 5px solid black;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';box-sizing: border-box;padding:0;margin: 0;width: 950px;">
                                                                            //             <div style="display:flex;align-items: center;border-bottom: 5px solid black;padding: 0;margin: 0;box-sizing: border-box;">
                                                                            //                 <div style="width: 80px;height: 60px;">
                                                                            //                     <img style="width: 100%; height:100%" src="${school_logo}" alt="logo"/>
                                                                            //                 </div>
                                                                            //                 <div style="flex:1 1;padding: 0;box-sizing: border-box;margin: 0;">
                                                                            //                     <h2 style="text-align: center;">${item.school.schoolname}</h2>
                                                                            //                 </div>
                                                                            //             </div>
                                                                            //             <div style="border-bottom: 5px solid black;">
                                                                            //                 <p style="text-align: center;padding: 0.5rem;margin: 0;box-sizing: border-box; font-weight: 700;font-size: 20px;">${item.school.address}</p>
                                                                            //             </div>
                                                                            //             <div style="border-bottom: 5px solid black;">
                                                                            //                 <p style="text-align: center;padding: 0.5rem;margin: 0;box-sizing: border-box; font-weight: 700;font-size: 18px;text-transform: uppercase;">salary slip for the month : ${item_new.month}-${item_new.year}</p>
                                                                            //             </div>
                                                                            //             <div style="display: flex;border-bottom: 3px solid black;">
                                                                            //                 <div style="flex :1 1;border-right: 2.5px solid black;padding: 0.5rem 0;">
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Employee Name : </span>
                                                                            //                         <span style="font-size: 22px;">${item.firstname} ${item.lastname}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Contact Person's Name : </span>
                                                                            //                         <span style="font-size: 22px;">${item.contact_person_name}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Role : </span>
                                                                            //                         <span style="font-size: 22px;">${item.assign_role.name}</span>
                                                                            //                     </div>
                                                                            //                     <!-- <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Bank Name : </span>
                                                                            //                         <span style="font-size: 22px;">SBI</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Pan No. : </span>
                                                                            //                         <span style="font-size: 22px;">ADSE23472A</span>
                                                                            //                     </div> -->
                                                                            //                 </div>
                                                                            //                 <div style="flex :1 1;border-left: 2.5px solid black;padding: 0.5rem 0;">
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Staff ID : </span>
                                                                            //                         <span style="font-size: 22px;">${item.SID}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Date of joining : </span>
                                                                            //                         <span style="font-size: 22px;">${common.formatDate(item.joining_date)} </span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Department : </span>
                                                                            //                         <span style="font-size: 22px;">${item.department.name}</span>
                                                                            //                     </div>
                                                                            //                     <!-- <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Pay Mode : </span>
                                                                            //                         <span style="font-size: 22px;">Cash</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">A/C No. : </span>
                                                                            //                         <span style="font-size: 22px;">ADSE23472A</span>
                                                                            //                     </div> -->
                                                                            //                 </div>
                                                                            //             </div>
                                                                            //             <div style="display: flex;justify-content:space-around;border-bottom:2.5px solid black;padding: 0.5rem;">
                                                                            //                 <span style="font-weight: 500;font-size:20px;">Month Days : ${totalDays}</span>
                                                                            //                 <span style="font-weight: 500;font-size:20px;">Lop Days : ${total_leaves}</span>
                                                                            //                 <span style="font-weight: 500;font-size:20px;">Pay days : ${totalDays - total_leaves}</span>
                                                                            //             </div>
                                                                            //             <div style="display: flex;">
                                                                            //             <div style="flex :1 1;border-right: 2.5px solid black;padding: 0.5rem 0;border-bottom: 3px solid black;"></div>
                                                                            //             <div style="flex :1 1;border-left: 2.5px solid black;padding: 0.5rem 0;border-bottom: 3px solid black;">
                                                                            //                     <span style="font-size: 22px;font-weight:500;text-transform: uppercase;padding-left: 0.5rem;">Deductions</span>
                                                                            //                 </div>
                                                                            //             </div>
                                                                            //             <div style="display: flex;">
                                                                            //                 <div style="flex :1 1;border-right: 2.5px solid black;padding: 0.5rem 0;">
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Basic Salary :  </span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.basic_salary}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Leave Travel Allowance : </span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.lta}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">House Rent Allowance : </span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.hra}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Gross Salary : </span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${total_amount}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;border-top: 3px solid black;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Total Earnings :</span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.salary_credit}</span>
                                                                            //                     </div>
                                                                            //                 </div>
                                                                            //                 <div style="flex :1 1;border-left: 2.5px solid black;padding: 0.5rem 0;">
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Professional Tax : </span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.professional_tax}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Other : </span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.others}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;visibility: hidden;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">(its hidden)</span>
                                                                            //                         <span style="font-size: 22px;">Rs. 200</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Total Deductions : </span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.total_deductions}</span>
                                                                            //                     </div>
                                                                            //                     <div style="display: flex;justify-content:space-between;padding:0 0.5rem;border-top: 3px solid black;">
                                                                            //                         <span style="font-size: 22px;font-weight:500;text-transform: uppercase;">Net Salary :</span>
                                                                            //                         <span style="font-size: 22px;">Rs. ${breakup_result.salary_credit}</span>
                                                                            //                     </div>
                                                                            //                 </div>
                                                                            //             </div>
                                                                            //         </div>
                                                                            //     </body>
                                                                            //     </html>
                                                                            var pdfFilePath = `./pdf/salary_${item_new.month}_${item._id}.pdf`;
                                                                            var options = { format: 'A4' };
                                                                            pdf.create(html, options).toFile(pdfFilePath, function (err, res2) {
                                                                                if (err) {
                                                                                    console.log(err);
                                                                                    res.status(500).send("Some kind of error...");
                                                                                    return;
                                                                                }
                                                                                fs.readFile(pdfFilePath, async function (err, data) {
                                                                                    var content = await fs.readFileSync(pdfFilePath);
                                                                                    common.uploadFileS3(content, `salary_${item_new.month}_${item._id}.pdf`, "application/pdf", function(r){
                                                                                        console.log(r)
                                                                                        next_new();
                                                                                    });
                                                                                });
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                    }
                                                }
                                            });
                                    } else {
                                        next_new();
                                    }
                                }
                            });
                    }, async function (err) {
                        next();
                    });
                }, async function (err) {
                    return res.status(200).json({ status: true });
                });
            }
        })
}

const getDays = (year, month) => {
    return new Date(year, month, 0).getDate();
};


exports.staffSalaryList = async (req, res) => {
    StaffSalary.find({ 'is_deleted': 'N', school: req.params.schoolID })
        .populate("staff")
        .populate({
            path: "staff",
            populate: {
                path: "department",
            },
        })
        .populate("school", "_id schoolname address city state")
        .sort({ createdAt: -1 })
        .exec(function (err, result) {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    err: "Problem in fetching salary data. Please try again.",
                });
            } else {
                var output = [];
                asyncLoop(result, async function (item, next) { // It will be executed one by one
                    common.getFileStreamCall(`salary_${item.month}_${item.staff._id}.pdf`, function(response){
                        output.push({
                            ...item.toObject(),
                            url: response
                        });
                        next();
                    });
                }, async function (err) {
                    return res.status(200).json(output);
                });
            }
        })
}
