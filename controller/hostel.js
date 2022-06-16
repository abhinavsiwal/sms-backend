//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Hostel = require("../model/hostel");
const HostelFloor = require("../model/hostel_floor");

exports.createBuilding = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            let buildingdetails = new Hostel(fields);
            try {
                buildingdetails.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            err: "Please Check Data!",
                        });
                    } else {
                        res.status(200).json(result);
                    }
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    err: "Problem in adding building. Please try again.",
                });
            }
        }
    });
};

exports.getAllBuildings = (req, res) => {
    try {
        Hostel.find({ school: req.schooldoc._id })
            .sort({ createdAt: -1 })
            .then((result, err) => {
                if (err || !result) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                return res.status(200).json(result);
            });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            err: "Problem in fetching building names. Please try again.",
        });
    }
};

exports.createBuildingFloor = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            let buildingdetails = new HostelFloor(fields);
            try {
                buildingdetails.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            err: "Please Check Data!",
                        });
                    } else {
                        res.status(200).json(result);
                    }
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    err: "Problem in adding buildings floor. Please try again.",
                });
            }
        }
    });
};
