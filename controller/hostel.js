//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Hostel = require("../model/hostel");
const HostelFloor = require("../model/hostel_floor");
const HostelRoomAllocation = require("../model/hostel_room_allocation");
const common = require("../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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


exports.getAllBuildingsFloors = (req, res) => {
    try {
        HostelFloor
            .find({ school: req.schooldoc._id })
            .populate('building')
            .sort({ createdAt: -1 })
            .then((result, err) => {
                if (err || !result) {
                    return res.status(400).json({
                        err: "Database Dont Have Building Details",
                    });
                }
                return res.status(200).json(result);
            });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            err: "Problem in fetching building details. Please try again.",
        });
    }
};

exports.allocateRoomList = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        console.log(fields)
        var rules = {
            role: 'required|in:STD,STF',
        }
        if (common.checkValidationRulesJson(fields, res, rules)) {
            if (fields.role === 'STD'){
                console.log("herre");
                var rules = {
                    class: 'required',
                    student: 'required',
                    section: 'required',
                }
            } else {
                var rules = {
                    department: 'required',
                    staff: 'required',
                }
            }
            if (common.checkValidationRulesJson(fields, res, rules)) {
                try {
                    var filter = { school: req.schooldoc._id };
                    if (fields.role.toString() === 'STD'){
                        console.log("herre");
                        filter.class = fields.class;
                        filter.student = fields.student;
                        filter.section = fields.section;
                    } else {
                        filter.department = fields.department;
                        filter.staff = fields.staff;
                    }
                    HostelRoomAllocation
                        .find(filter)
                        .populate('building')
                        .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err || !result) {
                                return res.status(400).json({
                                    err: "Database Dont Have Building Details",
                                });
                            }
                            return res.status(200).json(result);
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in fetching building details. Please try again.",
                    });
                }
            }
        }
    });
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


exports.getAllRooms = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            try {
                var building_id = fields.building_id;
                HostelFloor.find({building: building_id, school: req.params.schoolID}).exec((err, result) => {
                    if (err || ! result) {
                        return res.status(400).json({
                            err: "No Building was found in Database",
                        });
                    }
                    var rooms_per_floor = result[0].rooms_per_floor;
                    var no_of_floors = result[0].no_of_floors;
                    var sharing_type = result[0].sharing_type;
                    var room_numbers = [];
                    for (i = rooms_per_floor; i > 0; i--){
                        var room_no = i * 100;
                        for (j = no_of_floors; j > 0; j--){
                            room_no += j;
                            room_numbers.push(room_no);
                        }
                    }
                    HostelRoomAllocation
                        .aggregate([
                            { "$match": {building: ObjectId(building_id), school: ObjectId(req.params.schoolID), vacantBy: {$exists: false}} },
                            {$group:
                                {
                                    _id:
                                    {
                                        room_number: "$room_number"
                                    },
                                    room_number: {"$last":"$room_number"},
                                    count: {$sum: 1},
                                }
                            },
                        ]).then(result => {
                            if (result.length > 0){
                                for (var i = 0; i < result.length; i++){
                                    var index = room_numbers.indexOf(result[i].room_number);
                                    if ((index > -1 && sharing_type == 'single' && result[i].count > 0)
                                        || (index > -1 && sharing_type == 'double' && result[i].count > 1)
                                        || (index > -1 && result[i].count > 2)
                                    ){
                                        room_numbers.splice(index, 1);
                                    }
                                }
                            }
                            res.status(200).json(room_numbers);
                        });
                });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    err: "Problem in getting room numbers. Please try again.",
                });
            }
        }
    });

};

exports.allocateRoom = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            if ((fields.student && ( ! fields.class || ! fields.section)) || (fields.department && ! fields.staff)){
                return res.status(400).json({
                    err: "Problem With Data! Please check your data",
                });
            } else {
                fields.school = req.params.schoolID;
                fields.updatedBy = req.params.id;
                let roomAllocationDetails = new HostelRoomAllocation(fields);
                try {
                    roomAllocationDetails.save((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                err: "Please Check Data!",
                            });
                        } else {
                            return res.status(200).json(result);
                        }
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in allocating room. Please try again.",
                    });
                }
            }
        }
    });
}


exports.vacantRoom = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                err: "Problem With Data! Please check your data",
            });
        } else {
            if ((fields.student && ( ! fields.class || ! fields.section)) || (fields.department && ! fields.staff) || ! fields.room_number || ! fields.vacantBy || ! fields.vacantDate){
                return res.status(400).json({
                    err: "Problem With Data! Please check your data",
                });
            } else {
                fields.updatedBy = req.params.id;
                try {
                    if (fields.student){
                        var filters = {
                            student: fields.student,
                            class: fields.class,
                            section: fields.section,
                            room_number: fields.room_number
                        };
                    } else {
                        var filters = {
                            department: fields.department,
                            staff: fields.staff,
                            room_number: fields.room_number
                        };
                    }
                    HostelRoomAllocation.findOneAndUpdate(
                        filters,
                        { $set: { vacantDate: fields.vacantDate, vacantBy: fields.vacantBy  } },
                        {useFindAndModify: false}
                    )
                        .sort({ createdAt: -1 })
                        .then((result, err) => {
                            if (err || ! result) {
                                return res.status(400).json({
                                    err: "Database Don't Have Allocated Room",
                                });
                            }
                            return res.json(result);
                        });
                } catch (error) {
                    console.log(error);
                    return res.status(400).json({
                        err: "Problem in vacanting room. Please try again.",
                    });
                }
            }
        }
    });
}


exports.allocationHistory = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        var rules = {
            role: 'required|in:STU,STA',
            type: 'required|in:A,V',
        }
        if (common.checkValidationRulesJson(fields, res, rules)) {
            try {
                if (fields.role == 'STU'){
                    var filter = { school: req.schooldoc._id, student: {$exists:true} };
                } else {
                    var filter = { school: req.schooldoc._id, department: {$exists:true} };
                }
                if (fields.type == 'V'){
                    filter.vacantBy = { $exists: true };
                } else {
                    filter.vacantBy = { $exists: false };
                }
                HostelRoomAllocation
                    .find(filter)
                    .populate('building', '_id name abbreviation')
                    .populate('staff', '_id firstname lastname gender')
                    .populate('department', '_id name')
                    .populate('student', '_id firstname lastname gender')
                    .sort({ createdAt: -1 })
                    .then((result, err) => {
                        if (err || !result) {
                            return res.status(400).json({
                                err: "Database Dont Have Building Details",
                            });
                        }
                        return res.status(200).json(result);
                    });
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    err: "Problem in fetching building details. Please try again.",
                });
            }
        }
    });
};
