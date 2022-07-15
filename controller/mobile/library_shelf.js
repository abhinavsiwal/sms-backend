//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
//import require models
const Librarieshelf = require("../../model/librarie_shelf");
const Librariesection = require("../../model/librarie_section");
const common = require('./../../config/common');
//exports routes controller
exports.getLibrarieshelfByID = (req, res, next, id) => {
    try {
        Librarieshelf.findById(id).exec((err, librarieshelf) => {
            if (err || !librarieshelf) {
                return res.status(400).json({
                    err: "No School Admin was found in Database",
                });
            }
            req.librarieshelf = librarieshelf;
            next();
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getLibrarieshelfDetailsByID = (req, res, next, id) => {
    try {
        Librarieshelf.findById(id).exec((err, librarieshelf) => {
            if (err || !librarieshelf) {
                common.sendJSONResponse(res, 0, "Library shelf not available", null);
            } else {
                req.librarieshelf = librarieshelf;
                next();
            }
        });
    } catch (error) {
        console.log(error);
        common.sendJSONResponse(res, 0, "Library shelf not available", null);
    }
};

exports.createLibrarieshelf = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            common.sendJSONResponse(res, 0, "Problem With Data! Please check your data", null);
        } else {
            let librarieshelf = new Librarieshelf(fields);
            try {
                // librarieshelf.subject = JSON.parse(fields.subject);
                librarieshelf.save(async (err, librarieshelf) => {
                    if (err) {
                        common.sendJSONResponse(res, 0, "Shelf Already Exits!", null);
                    } else {
                        const shelf = await Librariesection.updateOne(
                            { _id: fields.section },
                            { $push: { shelf: librarieshelf._id } },
                            { new: true }
                        );
                        common.sendJSONResponse(res, 1, "Shelf added successfully", librarieshelf);
                    }
                });
            } catch (error) {
                console.log(error);
                common.sendJSONResponse(res, 0, "Problem in adding shelf. Please try again.", null);
            }
        }
    });
};
exports.getLibrarieshelf = (req, res) => {
    req.json(req.librarieshelf);
};
exports.updateLibrarieshelf = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields) => {
        if (err) {
            common.sendJSONResponse(res, 0, "Problem With Data! Please check your data", null);
        } else {
            let librarieshelf = req.librarieshelf;
            librarieshelf = _.extend(librarieshelf, fields);
            try {
                if (fields.subject) {
                    librarieshelf.subject = JSON.parse(fields.subject);
                }
                librarieshelf.save((err, librarieshelf) => {
                    if (err) {
                        common.sendJSONResponse(res, 0, "Update librarieshelf in Database is Failed", null);
                    } else {
                        common.sendJSONResponse(res, 1, "Library shelf updated successfully", librarieshelf);
                    }
                });
            } catch (error) {
                console.log(error);
                common.sendJSONResponse(res, 0, "Update librarieshelf in Database is Failed", null);
            }
        }
    });
};
exports.getAllLibrarieshelf = (req, res) => {
    try {
        Librarieshelf.find({ school: req.schooldoc._id })
            .populate("section")
            .sort({ createdAt: -1 })
            .then((librarieshelf, err) => {
                if (err || !librarieshelf) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                return res.json(librarieshelf);
            });
    } catch (error) {
        console.log(error);
    }
};
exports.deleteLibrarieshelf = (req, res) => {
    let librarieshelf = req.librarieshelf;
    try {
        librarieshelf.remove((err, librarieshelf) => {
            if (err || !librarieshelf) {
                common.sendJSONResponse(res, 0, "Can't Able To Delete librarieshelf", null);
            } else {
                common.sendJSONResponse(res, 1, `${librarieshelf.name} is Deleted SuccessFully`, true);
            }
        });
    } catch (error) {
        console.log(error);
        common.sendJSONResponse(res, 0, "Can't Able To Delete librarieshelf", null);
    }
};
