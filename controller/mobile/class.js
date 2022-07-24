//import all require dependencies
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");
const excelToJson = require("convert-excel-to-json");
const common = require("../../config/common");
//import require models
const Class = require("../../model/class");

//exports routes controller
exports.getClassByID = (req, res, next, id) => {
    try {
        Class.findById(id).exec((err, classs) => {
            if (err || !classs) {
                if (err){
                    console.log(err);
                }
                return common.sendJSONResponse(res, 0, "Class is not available", null);
            } else {
                req.class = classs;
                next();
            }
        });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in getting class. Please try again.", null);
    }
};

exports.createClass = (req, res) => {
    var fields = req.body;
    let classs = new Class(fields);
    try {
        Class.findOne(
            { name: fields.name, school: fields.school },
            (err, data) => {
                if (err) {
                    console.log(err);
                    return common.sendJSONResponse(res, 0, "Please Check Data!", null);
                } else {
                    if (data) {
                        return common.sendJSONResponse(res, 0, "Class Name is Already Used Please Change Name.", null);
                    } else {
                        classs.save((err, classs) => {
                            if (err) {
                                console.log(err);
                                return common.sendJSONResponse(res, 0, "Please Check Data!", null);
                            } else {
                                return common.sendJSONResponse(res, 1, "Class created successfully.", classs);
                            }
                        });
                    }
                }
            }
        );
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in creating class. Please try again.", null);
    }
};

exports.bulkCreateClass = (req, res) => {
    try {
        const excelData = excelToJson({
            sourceFile: fs.readFileSync(file.class.path),
            sheets: [
                {
                    // Excel Sheet Name
                    name: "Customers",

                    // Header Row -> be skipped and will not be present at our result object.
                    header: {
                        rows: 1,
                    },

                    // Mapping columns to keys
                    columnToKey: {
                        A: "_id",
                        B: "name",
                        C: "address",
                        D: "age",
                    },
                },
            ],
        });
        console.log(excelData);
    } catch (error) {
        console.log(error);
    }
};

exports.getClass = (req, res) => {
    req.json(req.classs);
};

exports.updateClass = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }

        try {
            let classs = req.class;
            if (fields.section) {
                classs.section = JSON.parse(fields.section);
            }
            classs = _.extend(classs, fields);
            classs.save((err, classs) => {
                if (err) {
                    return res.status(400).json({
                        err: "Update classs in Database is Failed",
                    });
                }
                res.json(classs);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getAllClass = (req, res) => {
    try {
        Class.find({ school: req.schooldoc._id })
            .populate("section")
            .populate({
                path: 'section',
                populate: {
                    path: "subject"
                }
            })
            .populate({
                path: 'section',
                populate: 'classTeacher'
            })
            .populate("session")
            .sort({ createdAt: -1 })
            .then((classs, err) => {
                if (err || !classs) {
                    if (err){
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "Class list not available.", null);
                }
                // console.log(classs)
            return common.sendJSONResponse(res, 1, "Class fetched successfully.", classs);
        });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in getting class. Please try again.", null);
    }
};

exports.updateSectionClass = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        console.log(fields);
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        } else {
            try {
                Class.findOneAndUpdate(
                    { _id: fields.id },
                    { $push: { section: fields.section } }
                )
                    .sort({ createdAt: -1 })
                    .then((classs, err) => {
                        if (err || !classs) {
                            return res.status(400).json({
                                err: "Database Don't Have Classes",
                            });
                        }
                        return res.json(classs);
                    });
            } catch (error) {
                console.log(error);
            }
        }
    });
};

exports.deleteClass = (req, res) => {
    let classs = req.class;
    try {
        classs.remove((err, classs) => {
            if (err || !classs) {
                return res.status(400).json({
                    err: "Can't Able To Delete classs",
                });
            }
            return res.json({
                Massage: `${classs.name} is Deleted SuccessFully`,
            });
        });
    } catch (error) {
        console.log(error);
    }
};
