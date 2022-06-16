//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
const Student = require("../../model/student");
const Staff = require("../../model/staff");

//import require models
const Librariehistory = require("../../model/librarie_history");
const Books = require("../../model/book");
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

exports.createLibrariehistory = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    console.log(fields);

    if (fields.status === "Allocated") {
      let book = await Books.findOne({ _id: fields.book });
      if (!book) {
        return res.status(400).json({ err: "Book not found in Database" });
      }
      if (book.quantity <= 0) {
        return res.status(400).json({ err: "Book not available" });
      }
      book.quantity = book.quantity - 1;
      let bookId = [];
      bookId = book.bookID.filter((book) => book !== fields.bookID);
      book.bookID = bookId;
      try {
        await book.save();
      } catch (err) {
        console.log(err);
        return res.status(400).json({ err: "Erorr in storing book" });
      }
      let history;
      try {
        history = await Librariehistory.create(fields);
      } catch (err) {
        console.log(err);
        return res.status(400).json({ err: "Erorr in allocating book" });
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
      return res.json(history);
    } else if (fields.status === "Return") {
      let book = await Books.findOne({ _id: fields.book });
      book.quantity = book.quantity + 1;
      book.bookID.push(fields.bookID);
      try {
        await book.save();
      } catch (err) {
        return res.status(400).json({ err: "Erorr in storing book" });
      }
      if (fields.student) {
        let student = await Student.findOne({ _id: fields.student });
        // console.log(student);

        console.log(fields.allocationId);
        let issuedBooks = student.issuedBooks.filter(
          (book) => book.toString() !== fields.allocationId.toString()
        );
        // console.log(issuedBooks);

        student.issuedBooks = issuedBooks;
        await student.save();
      } else if (fields.staff) {
        let staff = await Staff.findOne({ _id: fields.staff });

        let issuedBooks = staff.issuedBooks.filter(
          (book) => book.toString() !== fields.allocationId.toString()
        );
        // console.log(issuedBooks);
        staff.issuedBooks = issuedBooks;
        await staff.save();
      }

      let history;
      try {
        history = await Librariehistory.findByIdAndUpdate(
          fields.allocationId,
          fields,
          {
            new: true,
            runValidators: true,
            useFindAndModify: false,
          }
        );
      } catch (err) {
        console.log(err);
        return res.status(500).json({ err: "Error in Returning Book" });
      }
      return res.json(history);
    }
  });
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
      .populate("book")
      .populate("student")
      .populate("staff")
      .populate("allocatedBy")
      .populate("collectedBy")
      .populate("class")
      .populate("department")
      .populate("section");
    studentAllocations = allocatedHistory.filter((history) => history.student);
    staffAllocations = allocatedHistory.filter((history) => history.staff);

    let returnedHistory = await Librariehistory.find({ status: "Return" })
      .populate("book")
      .populate("student")
      .populate("staff")
      .populate("allocatedBy")
      .populate("collectedBy")
      .populate("class")
      .populate("department")
      .populate("section");
    studentReturns = returnedHistory.filter((history) => history.student);
    staffReturns = returnedHistory.filter((history) => history.staff);

    console.log(studentReturns);
  } catch (err) {
    console.log(err);
  }

  res.json({
    studentAllocations,
    studentReturns,
    staffAllocations,
    staffReturns,
  });
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
