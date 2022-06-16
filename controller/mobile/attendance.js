  //import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Attendance = require("../../model/attendance");

//exports routes controller

exports.createAttendance = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    try {
      var attendance = JSON.parse(fields.attendance);
      Attendance.insertMany(attendance, (err, attendances) => {
        if (err || !attendances) {
          return res.status(400).json({
            err: "Can't Able to save attendances right!",
          });
        } else {
          return res.json(attendances);
        }
      });
    } catch (error) {
      console.log("Create Attendance", error);
    }
  });
};

exports.getAttendance = (req, res) => {
  Attendance.findOne({ _id: req.attendance._id })
    .populate("class")
    .populate("school")
    .populate("section")
    .populate("session")
    .populate("student")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Staff",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.updateAttendance = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    try {
      let attendance = req.attendance;
      attendance = _.extend(attendance, fields);
      attendance.save((err, attendance) => {
        if (err) {
          return res.status(400).json({
            err: "Update attendance in Database is Failed",
          });
        }
        res.json(attendance);
      });
    } catch (error) {
      console.log("updateAttendance", error);
    }
  });
};

exports.getAllAttendance = (req, res) => {
  try {
    Attendance.find({ school: req.schooldoc._id })
      .populate("class")
      .populate("school")
      .populate("section")
      .populate("session")
      .populate("student")
      .sort({ createdAt: -1 })
      .then((attendance, err) => {
        if (err || !attendance) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(attendance);
      });
  } catch (error) {
    console.log("getAllAttendance", error);
  }
};

exports.getAllAttendanceByFilter = (req, res) => {
  let classs = req.body.class;
  let sections = req.body.section;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  try {
    Attendance.find({
      class: classs,
      section: sections,
      school: req.schooldoc._id,
    })
      .populate("student")
      .populate("section")
      .sort({ createdAt: 1 })
      .then(async (attendance, err) => {
        if (err || !attendance) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        var data = [];
        await attendance.map(async (attendance_data) => {
          if (
            new Date(attendance_data.date) >= new Date(start_date) &&
            new Date(attendance_data.date) <= new Date(end_date)
          ) {
            data.push(attendance_data);
          }
        });
        if (req.body.studentID) {
          var mainObj = {
            workingDay: [],
          };
          var studentData = [];
          var classTeacher = "";
          data.map(async (data) => {
            if (data.student.SID === req.body.studentID) {
              studentData.push(data);
              classTeacher = data.section.classTeacher;
            }
          });
          studentData.map(async (data) => {
            mainObj[
              data.student.firstname +
                data.student.lastname +
                " " +
                data.student.SID
            ] = [];
          });
          studentData.map(async (data) => {
            var newDate = data.date.toString();
            mainObj.workingDay.push(
              newDate.slice(8, 10) + "-" + newDate.slice(4, 7)
            );
          });
          const unique = [...new Set(mainObj.workingDay)];
          mainObj.workingDay = unique;
          await studentData.map(async (data) => {
            mainObj[
              data.student.firstname +
                data.student.lastname +
                " " +
                data.student.SID
            ].push(data.attendance_status);
          });
          if (req.id == classTeacher) {
            mainObj["classTeacher"] = true;
          } else {
            mainObj["classTeacher"] = false;
          }
          return res.json(mainObj);
        } else {
          var mainObj = {
            workingDay: [],
          };
          var classTeacher = "";
          data.map(async (data) => {
            mainObj[
              data.student.firstname +
                data.student.lastname +
                " " +
                data.student.SID
            ] = [];
            classTeacher = data.section.classTeacher;
          });
          data.map(async (data) => {
            var newDate = data.date.toString();
            console.log(newDate);
            mainObj.workingDay.push(
              newDate.slice(8, 10) + "-" + newDate.slice(4, 7)
            );
          });
          const unique = [...new Set(mainObj.workingDay)];
          mainObj.workingDay = unique;
          await data.map(async (data) => {
            mainObj[
              data.student.firstname +
                data.student.lastname +
                " " +
                data.student.SID
            ].push(data.attendance_status);
          });
          if (req.id == classTeacher) {
            mainObj["classTeacher"] = true;
          } else {
            mainObj["classTeacher"] = false;
          }
          return res.json(mainObj);
        }
      });
  } catch (error) {
    console.log("getAllAttendance", error);
  }
};
