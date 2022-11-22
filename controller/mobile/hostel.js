//import all require dependencies
const _ = require("lodash");

//import require models
const Hostel = require("../../model/hostel");
const HostelFloor = require("../../model/hostel_floor");
const HostelRoomAllocation = require("../../model/hostel_room_allocation");
const Student = require("../../model/student");
const common = require("../../config/common");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const Staff = require("../../model/staff");


exports.createBuilding = (req, res) => {
    var rules = {
        name: 'required',
        abbreviation: 'required',
        school: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        if (req.body.building_id) {
            Hostel.findOneAndUpdate(
                { _id: ObjectId(req.body.building_id) },
                { $set: { name: req.body.name, abbreviation: req.body.abbreviation } },
                { new: true, useFindAndModify: false },
            )
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err || ! result) {
                        if (err){
                            console.log(err)
                        }
                        return common.sendJSONResponse(res, 0, "Building is not available.", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Building updated successfully", result);
                    }
                });
        } else {
            let buildingdetails = new Hostel(req.body);
            try {
                buildingdetails.save((err, result) => {
                    if (err) {
                        console.log(err);
                        return common.sendJSONResponse(res, 0, "Please Check Data!", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Building added successfully", result);
                    }
                });
            } catch (error) {
                console.log(error);
                return common.sendJSONResponse(res, 0, "Problem in updating building data. Please try again.", null);
            }
        }
    }
};

exports.getAllBuildings = (req, res) => {
    try {
        Hostel.find({ school: req.schooldoc._id })
            .sort({ createdAt: -1 })
            .then((result, err) => {
                if (err || !result) {
                    if (err){
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "Building is not available", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Building fetched successfully", result);
                }
            });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in fetching building data. Please try again.", null);
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
                    if (err){
                        console.log(err);
                    }
                    return common.sendJSONResponse(res, 0, "Building don't have any floor", null);
                } else {
                    return common.sendJSONResponse(res, 1, "Building floors fetched successfully", result);
                }
            });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in fetching building details. Please try again.", null);
    }
};


exports.getAllBuildingsFloorsByBuildingId = (req, res) => {
    var rules = {
        building_id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            HostelFloor
                .find({ school: req.schooldoc._id, building: ObjectId(req.body.building_id) })
                .populate('building')
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err || !result) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Building don't have any floor", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Building floors fetched successfully", result);
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching building details. Please try again.", null);
        }
    }
};


exports.allocateRoomList = (req, res) => {
    var rules = {
        role: 'required|in:STD,STA',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        if (req.body.role == 'STD') {
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
        if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
            try {
                var filter = { school: req.schooldoc._id };
                if (req.body.role == 'STD') {
                    filter.class = req.body.class;
                    filter.student = req.body.student;
                    filter.section = req.body.section;
                } else {
                    filter.department = req.body.department;
                    filter.staff = req.body.staff;
                }
                HostelRoomAllocation
                    .find(filter)
                    .populate('building')
                    .sort({ createdAt: -1 })
                    .then((result, err) => {
                        if (err || !result) {
                            if (err){
                                console.log(err);
                            }
                            return common.sendJSONResponse(res, 0, "Building details are not available", null);
                        } else {
                            return common.sendJSONResponse(res, 1, "Building details fetched successfully", result);
                        }
                    });
            } catch (error) {
                console.log(error);
                return common.sendJSONResponse(res, 0, "Problem in fetching building details. Please try again.", null);
            }
        }
    }
};

exports.createBuildingFloor = (req, res) => {
    var rules = {
        building: 'required',
        no_of_floors: 'required',
        rooms_per_floor: 'required',
        sharing_type: 'required|in:single,double,triple',
        abbreviation: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        if (req.body.floor_id) {
            HostelFloor.findOneAndUpdate(
                { _id: ObjectId(req.body.floor_id) },
                {
                    $set: {
                        building: req.body.building,
                        no_of_floors: req.body.no_of_floors,
                        rooms_per_floor: req.body.rooms_per_floor,
                        sharing_type: req.body.sharing_type,
                        abbreviation: req.body.abbreviation
                    }
                },
                { new: true, useFindAndModify: false },
            )
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err || ! result) {
                        if (err){
                            console.log(err)
                        }
                        return common.sendJSONResponse(res, 0, "Problem in updating floor. Please try again.", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Floor updated successfully", result);
                    }
                });
        } else {
            let buildingdetails = new HostelFloor(req.body);
            try {
                buildingdetails.save((err, result) => {
                    if (err) {
                        return common.sendJSONResponse(res, 0, "Please check data.", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Floor added successfully", result);
                    }
                });
            } catch (error) {
                console.log(error);
                return common.sendJSONResponse(res, 0, "Problem in adding buildings floor. Please try again.", null);
            }
        }
    }
};


exports.getAllRooms = (req, res) => {
    try {
        var building_id = req.body.building_id;
        HostelFloor.find({ building: building_id, school: req.params.schoolID }).exec((err, result) => {
            if (err || ! result || ! result[0]) {
                if (err){
                    console.log(err);
                }
                return common.sendJSONResponse(res, 0, "Rooms are not available.", []);
            } else {
                var rooms_per_floor = result[0].rooms_per_floor;
                var no_of_floors = result[0].no_of_floors;
                var sharing_type = result[0].sharing_type;
                var room_numbers = [];
                for (var i = rooms_per_floor; i > 0; i--) {
                    var room_no = i * 100;
                    for (var j = no_of_floors; j > 0; j--) {
                        room_no += j;
                        room_numbers.push(room_no);
                    }
                }
                HostelRoomAllocation
                    .aggregate([
                        { "$match": { building: ObjectId(building_id), school: ObjectId(req.params.schoolID), vacantBy: { $exists: false } } },
                        {
                            $group:
                            {
                                _id:
                                {
                                    room_number: "$room_number"
                                },
                                room_number: { "$last": "$room_number" },
                                count: { $sum: 1 },
                            }
                        },
                    ]).then(result => {
                        if (result.length > 0) {
                            for (var i = 0; i < result.length; i++) {
                                var index = room_numbers.indexOf(result[i].room_number);
                                if ((index > -1 && sharing_type == 'single' && result[i].count > 0)
                                    || (index > -1 && sharing_type == 'double' && result[i].count > 1)
                                    || (index > -1 && result[i].count > 2)
                                ) {
                                    room_numbers.splice(index, 1);
                                }
                            }
                        }
                        return common.sendJSONResponse(res, 1, "Rooms fetched successfully", room_numbers);
                    });
            }
        });
    } catch (error) {
        console.log(error);
        return common.sendJSONResponse(res, 0, "Problem in getting room numbers. Please try again.", null);
    }
};

exports.allocateRoom = async (req, res) => {
    var error = true;
    if ((req.body.student && (!req.body.class || !req.body.section)) || (req.body.department && !req.body.staff)) {
        error = false;
        return common.sendJSONResponse(res, 0, "Problem With Data! Please check your data.", null);
    } else {
        if (req.body.student && error){
            await HostelRoomAllocation.findOne({ student: ObjectId(req.body.student) })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        error = false;
                        return common.sendJSONResponse(res, 0, "Problem in alloting room. Please try again.", null);
                    } else if (result) {
                        error = false;
                        return common.sendJSONResponse(res, 0, "Room is already alloted to the selected student.", null);
                    }
                });
        }
        if (req.body.staff && error){
            await HostelRoomAllocation.findOne({ staff: ObjectId(req.body.staff) })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        error = false;
                        return common.sendJSONResponse(res, 0, "Problem in alloting room. Please try again.", null);
                    } else if (result) {
                        error = false;
                        return common.sendJSONResponse(res, 0, "Room is already alloted to the selected staff.", null);
                    }
                });
        }
        if (error){
            req.body.school = req.params.schoolID;
            req.body.updatedBy = req.params.id;
            let roomAllocationDetails = await new HostelRoomAllocation(req.body);
            try {
                await roomAllocationDetails.save((err, result) => {
                    if (err) {
                        console.log(err);
                        return common.sendJSONResponse(res, 0, "Please Check Data!", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Room allocated successfully", result);
                    }
                });
            } catch (error) {
                console.log(error);
                return common.sendJSONResponse(res, 0, "Problem in allocating room. Please try again", null);
            }
        }
    }
}


exports.vacantRoom = (req, res) => {
    if ((req.body.student && (!req.body.class || !req.body.section)) || (req.body.department && !req.body.staff) || !req.body.room_number || !req.body.vacantBy || !req.body.vacantDate) {
        return common.sendJSONResponse(res, 0, "Problem With Data! Please check your data.", null);
    } else {
        req.body.updatedBy = req.params.id;
        try {
            if (req.body.student) {
                var filters = {
                    student: req.body.student,
                    class: req.body.class,
                    section: req.body.section,
                    room_number: req.body.room_number
                };
            } else {
                var filters = {
                    department: req.body.department,
                    staff: req.body.staff,
                    room_number: req.body.room_number
                };
            }
            HostelRoomAllocation.findOneAndUpdate(
                filters,
                { $set: { vacantDate: req.body.vacantDate, vacantBy: req.body.vacantBy } },
                { new: true, useFindAndModify: false },
            )
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err || ! result) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Database Don't Have Allocated Room", null);
                    } else {
                        return common.sendJSONResponse(res, 0, "Room vacant successfully.", result);
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in vacanting room. Please try again.", null);
        }
    }
}


exports.allocationHistory = (req, res) => {
    var rules = {
        role: 'required|in:STD,STA',
        type: 'required|in:A,V',
        page: 'required'
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            if (req.body.page <= 0){
                req.body.page = 1;
            }
            if (req.body.role == 'STD') {
                var filter = { school: req.schooldoc._id, student: { $exists: true } };
            } else {
                var filter = { school: req.schooldoc._id, department: { $exists: true } };
            }
            if (req.body.type == 'V') {
                filter.vacantBy = { $exists: true };
            } else {
                filter.vacantBy = { $exists: false };
            }
            HostelRoomAllocation
                .find(filter)
                .populate('building', '_id name abbreviation')
                .populate('staff', '_id firstname lastname gender SID')
                .populate('department', '_id name')
                .populate('student', '_id firstname lastname gender SID')
                .populate('allocatedBy', '_id firstname lastname gender SID')
                .populate('vacantBy', '_id firstname lastname gender SID')
                .populate('class', '_id name abbreviation')
                .populate('section', '_id name abbreviation')
                .populate('school', '_id schoolname')
                .sort({ createdAt: -1 })
                .skip((req.body.page-1) * parseInt(process.env.MOBILE_PAGE_LIMIT))
                .limit(parseInt(process.env.MOBILE_PAGE_LIMIT))
                .then((result, err) => {
                    if (err || !result) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 2, "Allocation history not available.", null);
                    } else {
                        return common.sendJSONResponse(res, 1, "Allocation details fetched successfully.", result);
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching room allocation details. Please try again.", null);
        }
    }
};


exports.deleteBuildingFloor = (req, res) => {
    var rules = {
        building_id: 'required',
        floor_id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            HostelRoomAllocation.findOne({ building: ObjectId(req.body.building_id) })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        return common.sendJSONResponse(res, 0, "Database Dont Have Floor Details.", null);
                    }
                    if (result) {
                        return common.sendJSONResponse(res, 0, "Student is added in this building floor. Please remove student to remove floor.", null);
                    }
                    Hostel.remove({ _id: ObjectId(req.body.floor_id) }, function (err) {
                        if (err) {
                            console.log(err);
                            return common.sendJSONResponse(res, 0, "Problem in deleting floor. Please try again.", null);
                        }
                        return common.sendJSONResponse(res, 1, "Floor deleted successfully", true);
                    });
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in deleting building floor. Please try again.", null);
        }
    }
};


exports.deleteBuilding = (req, res) => {
    var rules = {
        id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            HostelFloor.findOne({ building: ObjectId(req.body.id) })
                .then((result, err) => {
                    if (err) {
                        console.log(err);
                        return common.sendJSONResponse(res, 0, "Database Dont Have Building Details.", null);
                    }
                    if (result) {
                        return common.sendJSONResponse(res, 0, "Floors are exist in this building. Please delete floors to delete the building.", null);
                    }
                    Hostel.remove({ _id: ObjectId(req.body.id) }, function (err) {
                        if (err) {
                            console.log(err);
                            return common.sendJSONResponse(res, 0, "Problem in deleting building. Please try again.", null);
                        }
                        return common.sendJSONResponse(res, 1, "Building deleted successfully", true);
                    });
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in deleting building. Please try again.", null);
        }
    }
};


exports.buildingDetailsById = (req, res) => {
    var rules = {
        id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            Hostel.findOne({ _id: ObjectId(req.body.id) })
                .then((result, err) => {
                    if (err || !result) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Building details not available.", null);
                    }
                    return common.sendJSONResponse(res, 1, "Building details fetched successfully", result);
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching building details. Please try again.", null);
        }
    }
};


exports.buildingFloorDetailsById = (req, res) => {
    var rules = {
        id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            HostelFloor.findOne({ _id: ObjectId(req.body.id) })
                .populate('building', '_id name abbreviation')
                .then((result, err) => {
                    if (err || !result) {
                        if (err){
                            console.log(err);
                        }
                        return common.sendJSONResponse(res, 0, "Floor not available.", null);
                    }
                    return common.sendJSONResponse(res, 1, "Floor details fetched successfully", result);
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching floor details. Please try again.", null);
        }
    }
};


exports.vacantStudentList = (req, res) => {
    var rules = {
        class: 'required',
        section: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            HostelRoomAllocation
                .find({ school: req.schooldoc._id, student: { $exists: true }, vacantBy: { $exists: false } })
                .populate('student', '_id firstname lastname gender SID')
                .sort({ createdAt: -1 })
                .then((result_h, err) => {
                    if (err) {
                        return common.sendJSONResponse(res, 0, "Problem in fetching student list. Please try again.", null);
                    } else {
                        var filter = {
                            class: ObjectId(req.body.class),
                            section: ObjectId(req.body.section)
                        };
                        var not_in = [];
                        if (result_h && result_h.length > 0) {
                            result_h.forEach(stu => {
                                if (stu.student._id) {
                                    not_in.push(stu.student._id);
                                }
                            })
                            if (not_in.length > 0) {
                                filter._id = { $in: not_in };
                            }
                        }
                        Student.find(filter).select('_id firstname lastname email gender phone SID')
                            .then((result, err) => {
                                if (err || !result) {
                                    if (err){
                                        console.log(err);
                                    }
                                    return common.sendJSONResponse(res, 0, "Student list not available.", null);
                                }
                                var output = [];
                                if (result.length > 0){
                                    for (var i = 0; i < result.length; i++){
                                        for (var j = 0; j < result_h.length; j++){
                                            if (result[i]._id == result_h[j].student._id.toString()){
                                                output.push({ ...result_h[j].toObject() })
                                                break;
                                            }
                                        }
                                    }
                                }
                                return common.sendJSONResponse(res, 0, "Student list fetched successfully.", output);
                            });
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching student list. Please try again.", null);
        }
    }
};



exports.studentList = (req, res) => {
    var rules = {
        class: 'required',
        section: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            HostelRoomAllocation
                .find({ school: req.schooldoc._id, student: { $exists: true }, vacantBy: { $exists: true } })
                .populate('student', '_id firstname lastname gender SID')
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err) {
                        return common.sendJSONResponse(res, 0, "Problem in fetching student list. Please try again.", null);
                    } else {
                        var filter = {
                            class: ObjectId(req.body.class),
                            section: ObjectId(req.body.section)
                        };
                        var not_in = [];
                        if (result && result.length > 0) {
                            result.forEach(stu => {
                                if (stu.student._id) {
                                    not_in.push(stu.student._id);
                                }
                            })
                            if (not_in.length > 0) {
                                filter._id = { $nin: not_in };
                            }
                        }
                        Student.find(filter).select('_id firstname lastname email gender phone')
                            .then((result, err) => {
                                if (err || !result) {
                                    if (err){
                                        console.log(err);
                                    }
                                    return common.sendJSONResponse(res, 0, "Student list not available.", null);
                                }
                                return common.sendJSONResponse(res, 0, "Student list fetched successfully.", result);
                            });
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching student list. Please try again.", null);
        }
    }
};


exports.staffList = (req, res) => {
    var rules = {
        department_id: 'required',
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            let departmentId = req.body.department_id;
            HostelRoomAllocation
                .find({ school: req.schooldoc._id, department: { $exists: true }, vacentBy: { $exists: true }  })
                .populate('student', '_id firstname lastname gender SID')
                .sort({ createdAt: -1 })
                .then((result, err) => {
                    if (err) {
                        return common.sendJSONResponse(res, 0, "Problem in fetching staff list. Please try again.", null);
                    } else {
                        var filter = {
                            department: ObjectId(departmentId),
                            school: ObjectId(req.schooldoc._id),
                        };
                        var not_in = [];
                        if (result && result.length > 0) {
                            result.forEach(stu => {
                                if (stu.department) {
                                    not_in.push(stu.department);
                                }
                            })
                            if (not_in.length > 0) {
                                filter._id = { $nin: not_in };
                            }
                        }
                        Staff.find(filter).select('_id firstname lastname gender email phone')
                            .sort({ createdAt: -1 })
                            .then(async (staff, err) => {
                                if (err || !staff) {
                                    if (err){
                                        console.log(err);
                                    }
                                    return common.sendJSONResponse(res, 0, "Staff is not available.", null);
                                }
                                return common.sendJSONResponse(res, 1, "Staff list fetched successfully", staff);
                            });
                    }
                });
        } catch (error) {
            console.log(error);
            return common.sendJSONResponse(res, 0, "Problem in fetching staff list. Please try again.", null);
        }
    }
};
