//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const crypto = require("crypto");
var aws = require("aws-sdk");
const fs = require("fs");
const key = process.env.my_secret;
var encryptor = require("simple-encryptor")(key);
//import require models
const Fees = require("../model/fees");
const Classfees = require("../model/classfees");
const Session = require("../model/session");
const School = require("../model/schooldetail");

//s3 aws
aws.config.update({
    accessKeyId: process.env.accessKeyID,
    secretAccessKey: process.env.secretAccessID,
    region: process.env.region,
});
const s3 = new aws.S3();

//s3 upload file function
function uploadFile(file, name, type) {
    const params = {
        Bucket: process.env.BucketFees,
        Body: file,
        Key: `${name}`,
        ContentEncoding: "base64",
        ContentType: type,
    };
    return s3.upload(params).promise();
}

//exports routes controller
exports.getFeesByID = (req, res, next, id) => {
    try {
        Fees.findById(id).exec((err, fees) => {
            if (err || !fees) {
                return res.status(400).json({
                    err: "No Fees was found in Database",
                });
            }
            req.fees = fees;
            next();
        });
    } catch (error) {
        console.log(error);
    }
};

exports.createFees = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            let fees = new Fees(fields);
            try {
                Fees.findOne(
                    {
                        school: fields.school,
                        class: fields.class,
                        session: fields.session,
                        fees_type: fields.fees_type,
                    },
                    (err, data) => {
                        if (err) {
                            return res.status(400).json({
                                err: "Please Check Data!",
                            });
                        }
                        if (data) {
                            return res.status(400).json({
                                err: "Fees is Already Created",
                            });
                        }
                        if (!data) {
                            fees.fees = JSON.parse(fields.fees);
                            fees.save(async (err, fees) => {
                                if (err) {
                                    return res.status(400).json({
                                        err: "Please Check Data!",
                                    });
                                }
                                await Fees.find(
                                    {
                                        class: fees.class,
                                        session: fees.session,
                                        school: fees.school,
                                    },
                                    async (err, feesMain) => {
                                        let feesMethod = "";
                                        let value = 0;
                                        await Session.findOne(
                                            { _id: fees.session, school: fees.school },
                                            (err, session) => {
                                                feesMethod = session.fees_method;
                                            }
                                        );
                                        if (feesMethod === "monthly") {
                                            value = 12;
                                        } else if (feesMethod === "quarterly") {
                                            value = 4;
                                        } else if (feesMethod === "half_yearly") {
                                            value = 6;
                                        } else if (feesMethod === "Yearly") {
                                            value = 1;
                                        }
                                        let mainObject = [];
                                        let total = 0;
                                        await feesMain.map(async (itemFees) => {
                                            if (itemFees.fees_type === "OneTime") {
                                                itemFees.fees.map((feesObject) => {
                                                    let tempObj = {
                                                        subtotal: Number(feesObject.total),
                                                        name: feesObject.name,
                                                        total: feesObject.total,
                                                        type: "OneTime",
                                                    };
                                                    total = total + Number(feesObject.total);
                                                    mainObject.push(tempObj);
                                                });
                                            } else {
                                                itemFees.fees.map((feesObject) => {
                                                    let tempObj = {
                                                        subtotal: Number(feesObject.total) * value,
                                                        name: feesObject.name,
                                                        total: feesObject.total,
                                                        type: "Recurring",
                                                    };
                                                    total = total + Number(feesObject.total) * value;
                                                    mainObject.push(tempObj);
                                                });
                                            }
                                        });
                                        await Classfees.updateOne(
                                            {
                                                class: fees.class,
                                                session: fees.session,
                                                school: fees.school,
                                            },
                                            {
                                                $set: {
                                                    class: fees.class,
                                                    session: fees.session,
                                                    total: total,
                                                    classfees: mainObject,
                                                    school: fees.school,
                                                },
                                            },
                                            { upsert: true },
                                            (err, classfees) => {
                                                if (err) {
                                                    return res.status(400).json({
                                                        err: "Classfees Can't save",
                                                    });
                                                } else {
                                                    res.json(fees);
                                                }
                                            }
                                        );
                                    }
                                );
                            });
                        }
                    }
                );
            } catch (error) {
                console.log("Create Fees Error", error);
            }
        }
    });
};

exports.getFees = (req, res) => {
    Fees.findOne({ _id: req.fees._id })
        .populate("school")
        .populate("session")
        .populate("class")
        .then((data, err) => {
            if (err || !data) {
                return res.status(400).json({
                    err: "Can't able to find the Fees",
                });
            } else {
                return res.json(data);
            }
        });
};

exports.updateFees = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }
        try {
            let fees = req.fees;

            fees = _.extend(fees, fields);
            if (fields.fees) {
                fees.fees = JSON.parse(fields.fees);
            }
            fees.save(async (err, fees) => {
                if (err) {
                    return res.status(400).json({
                        err: "Update fees in Database is Failed",
                    });
                }
                await Fees.find(
                    { class: fees.class, session: fees.session, school: fees.school },
                    async (err, feesMain) => {
                        let feesMethod = "";
                        let value = 0;
                        await Session.findOne(
                            { _id: fees.session, school: fees.school },
                            (err, session) => {
                                feesMethod = session.fees_method;
                            }
                        );
                        if (feesMethod === "monthly") {
                            value = 12;
                        } else if (feesMethod === "quarterly") {
                            value = 4;
                        } else if (feesMethod === "half_yearly") {
                            value = 6;
                        } else if (feesMethod === "Yearly") {
                            value = 1;
                        }
                        let mainObject = [];
                        let total = 0;
                        await feesMain.map(async (itemFees) => {
                            if (itemFees.fees_type === "OneTime") {
                                itemFees.fees.map((feesObject) => {
                                    let tempObj = {
                                        subtotal: Number(feesObject.total),
                                        name: feesObject.name,
                                        total: feesObject.total,
                                        type: "OneTime",
                                    };
                                    total = total + Number(feesObject.total);
                                    mainObject.push(tempObj);
                                });
                            } else {
                                itemFees.fees.map((feesObject) => {
                                    let tempObj = {
                                        subtotal: Number(feesObject.total) * value,
                                        name: feesObject.name,
                                        total: feesObject.total,
                                        type: "Recurring",
                                    };
                                    total = total + Number(feesObject.total) * value;
                                    mainObject.push(tempObj);
                                });
                            }
                        });
                        await Classfees.updateOne(
                            { class: fees.class, session: fees.session, school: fees.school },
                            {
                                $set: {
                                    class: fees.class,
                                    session: fees.session,
                                    total: total,
                                    classfees: mainObject,
                                    school: fees.school,
                                },
                            },
                            { upsert: true },
                            (err, classfees) => {
                                if (err) {
                                    return res.status(400).json({
                                        err: "Classfees Can't save",
                                    });
                                } else {
                                    res.json(fees);
                                }
                            }
                        );
                    }
                );
            });
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getAllFees = (req, res) => {
    try {
        Fees.find({ school: req.schooldoc._id })
            .populate("school")
            .populate("session")
            .populate("class")
            .sort({ createdAt: -1 })
            .then((fees, err) => {
                if (err || !fees) {
                    return res.status(400).json({
                        err: "Database Dont Have Fees",
                    });
                }
                return res.json(fees);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.getAllFeesCustome = (req, res) => {
    var classs = req.body.class;
    var session = req.body.session;
    var fees_type = req.body.fees_type;
    try {
        Fees.findOne({
            school: req.schooldoc._id,
            class: classs,
            fees_type: fees_type,
            session: session,
        })
            .populate("school")
            .populate("session")
            .populate("class")
            .sort({ createdAt: -1 })
            .then((fees, err) => {
                if (err || !fees) {
                    return res.status(400).json({
                        err: "Database Dont Have Fees",
                    });
                }
                return res.json(fees);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.getAllFeesObject = (req, res) => {
    var classs = req.body.class;
    var session = req.body.session;
    try {
        Fees.find({
            school: req.schooldoc._id,
            class: classs,
            session: session,
        })
            .populate("school")
            .populate("session")
            .populate("class")
            .sort({ createdAt: -1 })
            .then(async (fees, err) => {
                if (err || !fees) {
                    return res.status(400).json({
                        err: "Database Dont Have Fees",
                    });
                }
                var feesObject = [];
                await fees.map(async (data) => {
                    for (let i = 0; i < data.fees.length; i++) {
                        feesObject.push(data.fees[i]["name"]);
                    }
                });
                const unique = [...new Set(feesObject)];
                return res.json(unique);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.deleteFees = (req, res) => {
    let fees = req.fees;
    try {
        fees.remove((err, fees) => {
            if (err || !fees) {
                return res.status(400).json({
                    err: "Can't Able To Delete fees",
                });
            }
            return res.json({
                Massage: `Fees is Deleted SuccessFully`,
            });
        });
    } catch (error) {
        console.log(error);
    }
    
};
