//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const Student = require("../../model/student");
const Staff = require("../../model/staff");
const common = require('./../../config/common');
//import require models
const Librariehistory = require("../../model/librarie_history");
const Books = require("../../model/book");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
//exports routes controller
exports.getLibrariehistoryByID = (req, res, next, id) => {
    try {
        Librariehistory.findById(id).exec((err, librariehistory) => {
            if (err || !librariehistory) {
                return res.status(400).json({
                    err: "No School Admin was found in Database",
                });
            }
            req.librariehistory = librariehistory;
            next();
        });
    } catch (error) {
        console.log(error);
    }
};


exports.getLibrariehistoryDetailsByID = (req, res, next, id) => {
    try {
        Librariehistory.findById(id).exec((err, librariehistory) => {
            if (err || !librariehistory) {
                common.sendJSONResponse(res, 0, "Library history not available", null);
            } else {
                req.librariehistory = librariehistory;
                next();
            }
        });
    } catch (error) {
        common.sendJSONResponse(res, 0, "Problem in fetching library history", null);
        console.log(error);
    }
};



exports.createLibrariehistory = async (req, res) => {
    var fields = req.body;
    if (fields.status === "Allocated") {
        let book = await Books.findOne({ _id: fields.book });
        if ( ! book) {
            return common.sendJSONResponse(res, 0, "Book not found in Database", null);
        }
        if (book.quantity <= 0) {
            return common.sendJSONResponse(res, 0, "Book not available", null);
        }
        book.quantity = book.quantity - 1;
        let bookId = [];
        bookId = book.bookID.filter((book) => book !== fields.bookID);
        book.bookID = bookId;
        try {
            await book.save();
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Erorr in storing book", null);
        }
        let history;
        try {
            history = await Librariehistory.create(fields);
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Erorr in allocating book", null);
        }
        if (fields.student) {
            let student = await Student.findOne({ _id: fields.student });
            // console.log(student);
            student.issuedBooks.push(history._id);
            await student.save();
        } else if (fields.staff) {
            let staff = await Staff.findOne({ _id: fields.staff });
            staff.issuedBooks.push(history._id);
            await staff.save();
        }
        return common.sendJSONResponse(res, 1, "Book allocated successfully", history);
    } else if (fields.status === "Return") {
        let book = await Books.findOne({ _id: fields.book });
        if (fields.student){
            var allocation_data = await Librariehistory.findOne({ book: ObjectId(fields.book), student: ObjectId(fields.student), bookID: fields.bookID });
        } else {
            var allocation_data = await Librariehistory.findOne({ book: ObjectId(fields.book), staff: ObjectId(fields.staff), bookID: fields.bookID });
        }
        if ( ! allocation_data){
            return common.sendJSONResponse(res, 0, "The book allocation is not available. Please check the data.", null);
        }
        if ( ! fields.allocationId){
            fields.allocationId = allocation_data._id;
        }
        book.quantity = book.quantity + 1;
        book.bookID.push(fields.bookID);
        try {
            await book.save();
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Erorr in storing book", null);
        }
        if (fields.student) {
            let student = await Student.findOne({ _id: fields.student });
            let issuedBooks = student.issuedBooks.filter(
                (book) => book.toString() !== fields.allocationId.toString()
            );
            student.issuedBooks = issuedBooks;
            await student.save();
        } else if (fields.staff) {
            let staff = await Staff.findOne({ _id: fields.staff });
            let issuedBooks = staff.issuedBooks.filter(
                (book) => book.toString() !== fields.allocationId.toString()
            );
            staff.issuedBooks = issuedBooks;
            await staff.save();
        }
        let history;
        try {
            history = await Librariehistory.findOneAndUpdate(
                {_id: ObjectId(fields._id)},
                { $set: {
                    collectedBy: fields.collectedBy,
                    collectionDate: fields.collectionDate,
                    returned: true,
                    status: "Return",
                } },
                {new:true, useFindAndModify: false},
            );
        } catch (err) {
            console.log(err);
            return common.sendJSONResponse(res, 0, "Error in Returning Book", null);
        }
        return common.sendJSONResponse(res, 1, "Book return successfully", history);
    }
};

exports.getLibrariehistory = (req, res) => {
    req.json(req.librariehistory);
};

exports.updateLibrariehistory = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        }

        try {
            let librariehistory = req.librariehistory;
            librariehistory = _.extend(librariehistory, fields);
            librariehistory.save((err, librariehistory) => {
                if (err) {
                    return res.status(400).json({
                        err: "Update librariehistory in Database is Failed",
                    });
                }
                res.json(librariehistory);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getAllLibrariehistory = (req, res) => {
    try {
        Librariehistory.find({ school: req.schooldoc._id })
            .sort({ createdAt: -1 })
            .populate("book")
            .populate({
                path: "student",
                populate: {
                    path: "class",
                },
            })
            .populate({
                path: "staff",
                populate: {
                    path: "department",
                },
            })
            .populate("allocatedBy")
            .populate("collectedBy")
            .then((librariehistory, err) => {
                if (err || !librariehistory) {
                    return res.status(400).json({
                        err: "Database Dont Have Admin",
                    });
                }
                return res.json(librariehistory);
            });
    } catch (error) {
        console.log(error);
    }
};

exports.updateStatusLibrariehistory = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields) => {
        if (err) {
            return res.status(400).json({
                err: "Problem With Data!",
            });
        } else {
            try {
                Librariehistory.findOneAndUpdate(
                    { _id: fields.id },
                    { $set: { status: fields.status } },
                    { new: true }
                )
                    .sort({ createdAt: -1 })
                    .then((librariehistory, err) => {
                        if (err || !librariehistory) {
                            return res.status(400).json({
                                err: "Database Don't Have Librariehistoryes",
                            });
                        }
                        return res.json(librariehistory);
                    });
            } catch (error) {
                console.log(error);
            }
        }
    });
};

exports.deleteLibrariehistory = (req, res) => {
    let librariehistory = req.librariehistory;
    try {
        librariehistory.remove((err, librariehistory) => {
            if (err || !librariehistory) {
                return res.status(400).json({
                    err: "Can't Able To Delete librariehistory",
                });
            }
            return res.json({
                Massage: `Deleted SuccessFully`,
            });
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getAllHistoryByType = async (req, res) => {
    let studentAllocations = [];
    let studentReturns = [];
    let staffAllocations = [];
    let staffReturns = [];
    try {
        let allocatedHistory = await Librariehistory.find({ status: "Allocated" })
            .populate("book", '_id name author')
            .populate("student", '_id firstname lastname gender SID')
            .populate("staff", '_id firstname lastname gender SID')
            .populate("allocatedBy", '_id firstname lastname gender')
            .populate("collectedBy", '_id firstname lastname gender email phone')
            .populate("class", '_id name abbreviation')
            .populate("department", '_id name')
            .populate("section", '_id name abbreviation')
        studentAllocations = allocatedHistory.filter((history) => history.student);
        staffAllocations = allocatedHistory.filter((history) => history.staff);

        let returnedHistory = await Librariehistory.find({ status: "Return" })
            .populate("book", '_id name author')
            .populate("student", '_id firstname lastname gender SID')
            .populate("staff", '_id firstname lastname gender SID')
            .populate("allocatedBy", '_id firstname lastname gender')
            .populate("collectedBy", '_id firstname lastname gender email phone')
            .populate("class", '_id name abbreviation')
            .populate("department", '_id name')
            .populate("section", '_id name abbreviation')
        studentReturns = returnedHistory.filter((history) => history.student);
        staffReturns = returnedHistory.filter((history) => history.staff);
        var data = {
            studentAllocations,
            studentReturns,
            staffAllocations,
            staffReturns,
        }
        common.sendJSONResponse(res, 1, "Library history fetched successfully", data);
    } catch (err) {
        console.log(err);
        common.sendJSONResponse(res, 0, "Problem in fetching library history. Please try again.", null);
    }
};

exports.getAllAllocatedBooksBySID = async (req, res) => {
    const sId = req.params.sId;
    let user = sId.slice(3, 6);
    let books = [];
    if (user === "STD") {
        let student;
        try {
            student = await Student.findOne({ SID: sId });
            //   console.log(student);
        } catch (err) {
            console.log(err);
        }
        if (!student) {
            return res.status(400).json({ err: "Student Not Found" });
        }

        try {
            books = await Librariehistory.find({
                student: student._id,
                status: "Allocated",
            })
                .populate("book")
                .populate("student")
                .populate("staff")
                .populate("allocatedBy")
                .populate("collectedBy")
                .populate("class")
                .populate("department")
                .populate("section");
            //   console.log(leave);
        } catch (err) {
            console.log(err);
        }
        if (!books) {
            return res.status(400).json({ err: "No Book Found" });
        }
    } else if (user === "STF") {
        let staff;

        try {
            staff = await Staff.findOne({ SID: sId });
        } catch (err) {
            console.log(err);
        }
        if (!staff) {
            return res.status(400).json({ err: "Staff Not Found" });
        }

        try {
            books = await Librariehistory.find({
                staff: staff._id,
                status: "Allocated",
            }).populate("book").populate("student").populate("staff").populate("allocatedBy").populate("collectedBy").populate("class").populate("department").populate("section");
        } catch (err) {
            console.log(err);
        }
        if (!books) {
            return res.status(400).json({ err: "No Book Found" });
        }
    }
    return res.status(200).json(books);
};

exports.getAllReturnBooksBySID = async (req, res) => {
    const sId = req.params.sId;
    let user = sId.slice(3, 6);
    let books = [];
    if (user === "STD") {
        let student;
        try {
            student = await Student.findOne({ SID: sId });
            //   console.log(student);
        } catch (err) {
            console.log(err);
        }
        if (!student) {
            return res.status(400).json({ err: "Student Not Found" });
        }

        try {
            books = await Librariehistory.find({
                student: student._id,
                status: "Return",
            }).populate("book");
            //   console.log(leave);
        } catch (err) {
            console.log(err);
        }
        if (!books) {
            return res.status(400).json({ err: "No Book Found" });
        }
    } else if (user === "STF") {
        let staff;

        try {
            staff = await Staff.findOne({ SID: sId });
        } catch (err) {
            console.log(err);
        }
        if (!staff) {
            return res.status(400).json({ err: "Staff Not Found" });
        }

        try {
            books = await Librariehistory.find({
                staff: staff._id,
                status: "Return",
            }).populate("book");
        } catch (err) {
            console.log(err);
        }
        if (!books) {
            return res.status(400).json({ err: "No Book Found" });
        }
    }
    return res.status(200).json(books);
};


exports.myHistory = async (req, res) => {
    var rules = {
        role: 'required|in:STD,STA',
        type: 'required|in:A,R',
        page: 'required'
    }
    if (req.body.role && req.body.role == 'STD'){
        rules.student = 'required';
    } else if (req.body.role && req.body.role == 'STA'){
        rules.staff = 'required';
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            if (req.body.page <= 0){
                req.body.page = 1;
            }
            if (req.body.role == 'STD'){
                var filter = {};
                if (req.body.type == 'A'){
                    filter = { status: "Allocated", student: req.body.student };
                } else {
                    filter = { status: "Return", student: req.body.student };
                }
            } else {
                if (req.body.type == 'A'){
                    filter = { status: "Allocated", staff: req.body.staff };
                } else {
                    filter = { status: "Return", staff: req.body.staff };
                }
            }
            await Librariehistory.find(filter)
                .populate("book", '_id name author')
                .populate("student", '_id firstname lastname gender SID roll_number')
                .populate("staff", '_id firstname lastname gender SID')
                .populate("allocatedBy", '_id firstname lastname gender')
                .populate("collectedBy", '_id firstname lastname gender email phone')
                .populate("class", '_id name abbreviation')
                .populate("department", '_id name')
                .populate("section", '_id name abbreviation')
                .sort({createdAt: -1})
                .skip((req.body.page-1) * parseInt(process.env.MOBILE_PAGE_LIMIT))
                .limit(parseInt(process.env.MOBILE_PAGE_LIMIT)).then((allocatedHistory, err) =>{
                    if (err){
                        console.log(err);
                        return common.sendJSONResponse(res, 0, "Problem in fetching library history. Please try again.", null);
                    } else {
                        if (allocatedHistory.length > 0){
                            return common.sendJSONResponse(res, 1, "Library history fetched successfully", allocatedHistory);
                        } else {
                            return common.sendJSONResponse(res, 2, "Library history not available", allocatedHistory);
                        }
                    }
                })
        } catch (err) {
            console.log(err);
            common.sendJSONResponse(res, 0, "Problem in fetching library history. Please try again.", null);
        }
    };
};


exports.getIssuedBooks = async (req, res) => {
    var rules = {
        role: 'required|in:STD,STA',
    }
    if (req.body.role && req.body.role == 'STD'){
        rules.student = 'required';
    } else if (req.body.role && req.body.role == 'STA'){
        rules.staff = 'required';
    }
    if (common.checkValidationRulesJson(req.body, res, rules, 'M')) {
        try {
            if (req.body.page <= 0){
                req.body.page = 1;
            }
            if (req.body.role == 'STD'){
                var filter = { status: "Allocated", student: req.body.student };
            } else {
                var filter = { status: "Allocated", staff: req.body.staff };
            }
            await Librariehistory.find(filter)
                .populate("book", '_id name author')
                .sort({createdAt: -1})
                .then((allocatedHistory, err) =>{
                    if (err){
                        console.log(err);
                        return common.sendJSONResponse(res, 0, "Problem in fetching issued books. Please try again.", null);
                    } else {
                        if (allocatedHistory.length > 0){
                            return common.sendJSONResponse(res, 1, "Issued books fetched successfully", allocatedHistory);
                        } else {
                            return common.sendJSONResponse(res, 0, "No book is issued", null);
                        }
                    }
                })
        } catch (err) {
            console.log(err);
            common.sendJSONResponse(res, 0, "Problem in fetching issued books. Please try again.", null);
        }
    };
};

