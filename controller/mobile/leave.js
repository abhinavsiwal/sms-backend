const formidable = require("formidable");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");

const Leave = require("../../model/leave");
const Staff = require("../../model/staff");
const Attendance = require("../../model/attendance");
const Student = require("../../model/student");

exports.createLeave = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, file) => {
    console.log(fields);
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(fields.dateTo);
    const secondDate = new Date(fields.dateFrom);

    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    fields.noOfDays = diffDays;
    let student;
    let staff;

    if (fields.user === "student") {
      try {
        student = await Student.find({ _id: fields.userId });
        // console.log(student);
      } catch (error) {
        console.log(err);
      }
      if (!student) {
        return res.status(400).json({ err: "Student Not Found" });
      }
      fields.student = fields.userId;
      fields.type = "student";
      //   console.log(fields);
    }

    if (fields.user === "staff") {
      try {
        staff = await Staff.find({ _id: fields.userId });
        log(staff);
      } catch (error) {
        console.log(err);
      }
      if (!staff) {
        return res.status(400).json({ err: "Staff Not Found" });
      }
      fields.staff = fields.userId;
      fields.type = "staff";
    }

    let leave;
    try {
      leave = await Leave.create(fields);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        err: "Please Check Data!",
      });
    }
    res.status(200).json(leave);
  });
};

exports.editLeave = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let leave = {};
    try {
      leave = await Leave.findOneAndUpdate(
        { _id: fields.id },
        { $set: { status: fields.status } },
        { new: true }
      );
    } catch (err) {
      console.log(err);
    }
    if (!leave) {
      return res.status(400).json({ err: "Leave Not Found" });
    }

    if (fields.status === "Approved") {
      let attendance;
      console.log("here");
      console.log(leave);
      let date = leave.dateFrom;

      try {
        for (let i = 1; i <= leave.noOfDays; i++) {
          attendance = Attendance.create({
            date: date,
            attendance_status: "L",
            class: leave.class,
            section: leave.section,
            school: leave.school,
            student: leave.student,
            session:leave.session,
          }); 
          date++;
        }
      } catch (err) {
        console.log(err);
      }
    }

    return res.status(200).json(leave);
  });
};

exports.getLeaveBySID = async (req, res) => {
  const sId = req.params.sId;
  //   console.log(sId);
  let user = sId.slice(3, 6);
  let leave;
  if (user === "STD") {
    let student;
    try {
      student = await Student.find({ SID: sId });
      //   console.log(student);
    } catch (err) {
      console.log(err);
    }
    if (!student) {
      return res.status(400).json({ err: "Student Not Found" });
    }

    try {
      leave = await Leave.find({ student: student[0]._id });
      //   console.log(leave);
    } catch (err) {
      console.log(err);
    }
    if (!leave) {
      return res.status(400).json({ err: "No Leave Found" });
    }
  } else if (user === "STF") {
    let staff;

    try {
      staff = await Staff.find({ SID: sId });
    } catch (err) {
      console.log(err);
    }
    if (!staff) {
      return res.status(400).json({ err: "Staff Not Found" });
    }

    try {
      leave = await Leave.find({ staff: staff[0]._id });
    } catch (err) {
      console.log(err);
    }
    if (!leave) {
      return res.status(400).json({ err: "No Leave Found" });
    }
  }
  return res.status(200).json(leave);
};

exports.getAllLeaves = async (req, res) => {
  let leave;
  try {
    leave = await Leave.find().populate("student").populate("staff");
  } catch (err) {
    console.log(err);
  }
  if (!leave) {
    return res.status(400).json({ err: "No Leave Found" });
  }
  return res.status(200).json(leave);
};

exports.getAllStaffLeaves = async (req, res) => {
  let leaves;
  try {
    leaves = await Leave.find({ type: "staff" })
      .populate("staff")
      .populate("department");
  } catch (err) {
    console.log(err);
  }
  if (!leaves) {
    return res.status(400).json({ err: "No Leave Found" });
  }
  return res.status(200).json(leaves);
};

exports.getAllStudentLeaves = async (req, res) => {
  let leaves;
  try {
    leaves = await Leave.find({ type: "student" })
      .populate("student")
      .populate("class")
      .populate("section");
  } catch (err) {
    console.log(err);
  }
  if (!leaves) {
    return res.status(400).json({ err: "No Leave Found" });
  }
  return res.status(200).json(leaves);
};

exports.deleteLeaveById = async (req, res) => {
  const sId = req.params.sId;
  const leaveId = req.params.leaveId;
  // console.log(sId);
  let user = sId.slice(3, 6);
  let student;
  let staff;
  let leave;
  if (user === "STD") {
    try {
      student = await Student.find({ SID: sId });
    } catch (err) {
      console.log(err);
    }
    if (!student) {
      return res.status(400).json({ err: "Student Not Found" });
    }

    try {
      leave = await Leave.findById(leaveId);
    } catch (err) {
      console.log(err);
    }
    if (!leave) {
      return res.status(400).json({ err: "No Leave Found" });
    }
    try {
      await leave.remove();
    } catch (err) {
      console.log(err);
    }
    return res.status(200).json({ msg: "Leave Deleted" });
  } else if (user === "STF") {
    try {
      staff = await Staff.find({ SID: sId });
    } catch (err) {
      console.log(err);
    }
    if (!staff) {
      return res.status(400).json({ err: "Staff Not Found" });
    }

    try {
      leave = await Leave.findById(leaveId);
    } catch (err) {
      console.log(err);
    }
    if (!leave) {
      return res.status(400).json({ err: "No Leave Found" });
    }
    try {
      await leave.remove();
    } catch (err) {
      console.log(err);
    }
    return res.status(200).json({ msg: "Leave Deleted" });
  }
};

exports.getLeavesByStaff = async (req, res) => {
  const sId = req.params.sId;
  let staff;

  try {
    staff = await Staff.findOne({ SID: sId });
  } catch (err) {
    console.log(err);
  }

  if (!staff) {
    return res.status(400).json({ err: "Staff Not Found" });
  }
  let studentLeave = [];
  let staffLeave = [];

  if (staff.isHead === true) {
    try {
      staffLeave = await Leave.find({ department: staff.head })
        .populate("staff")
        .populate("department");
    } catch (err) {
      console.log(err);
    }
  }
  if (staff.isClassTeacher === true) {
    try {
      studentLeave = await Leave.find({ section: staff.schoolClassTeacher })
        .populate("student")
        .populate("class")
        .populate("section");
    } catch (err) {
      console.log(err);
    }
  }

  return res.status(200).json({ studentLeave, staffLeave });
};
