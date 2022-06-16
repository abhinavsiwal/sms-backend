//import all require dependencies
const formidable = require("formidable");
const { toLower } = require("lodash");
const _ = require("lodash");

//import require models
const Attendance = require("../model/attendance");
const Student = require("../model/student");

//exports routes controller
exports.getAttendanceByID = (req, res, next, id) => {
  try {
    Attendance.findById(id).exec((err, attendance) => {
      if (err || !attendance) {
        return res.status(400).json({
          err: "No Attendance was found in Database",
        });
      }
      req.attendance = attendance;
      next();
    });
  } catch (error) {
    console.log("getAttendanceByID", error);
  }
};

exports.createAttendance = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    try {
      var attendance = JSON.parse(fields.attendance);
      Attendance.find({
        student: attendance[0].student,
        date: attendance[0].date,
      }).then(async (attendance_one, err) => {
        if (attendance_one.length > 0) {
          return res.status(400).json({
            err: "Attendance Can't Be Repeat Please Check Your Data!",
          });
        } else {
          Attendance.insertMany(attendance, (err, attendances) => {
            if (err || !attendances) {
              return res.status(400).json({
                err: "Can't Able to save attendances right!",
              });
            } else {
              return res.json(attendances);
            }
          });
        }
      });
    } catch (error) {
      console.log("Create Attendance", error);
    }
  });
};

exports.getAttendance = (req, res) => {
  return res.json(req.attendance);
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
      .populate("section")
      .populate("session")
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
  let session = req.body.session;
  let today = req.body.today_date;
  try {
    if (req.body.studentID) {
      Attendance.find({
        session: session,
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
              new Date(attendance_data.date).valueOf() >=
                new Date(start_date).valueOf() &&
              new Date(attendance_data.date).valueOf() <=
                new Date(end_date).valueOf()
            ) {
              data.push(attendance_data);
            }
          });

          var mainObj = {
            workingDay: [],
            studentDatas: {},
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
            mainObj.studentDatas[
              data.student.firstname +
                " " +
                data.student.lastname +
                "," +
                data.student.SID +
                "," +
                data.student._id
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
            mainObj.studentDatas[
              data.student.firstname +
                " " +
                data.student.lastname +
                "," +
                data.student.SID +
                "," +
                data.student._id
            ].push(data.attendance_status);
          });
          if (req.id == classTeacher) {
            mainObj["classTeacher"] = true;
            mainObj["Today"] = false;
          } else {
            mainObj["classTeacher"] = false;
            mainObj["Today"] = false;
          }
          await data.map(async (data) => {
            if (
              mainObj.studentDatas[
                data.student.firstname +
                  " " +
                  data.student.lastname +
                  "," +
                  data.student.SID +
                  "," +
                  data.student._id
              ].length < mainObj.workingDay.length
            ) {
              let tempData =
                mainObj.studentDatas[
                  data.student.firstname +
                    " " +
                    data.student.lastname +
                    "," +
                    data.student.SID +
                    "," +
                    data.student._id
                ];
              let diff = mainObj.workingDay.length - tempData.length;
              for (let i = 0; i < diff; i++) {
                tempData.unshift("N");
              }
              mainObj.studentDatas[
                data.student.firstname +
                  " " +
                  data.student.lastname +
                  "," +
                  data.student.SID +
                  "," +
                  data.student._id
              ] = tempData;
            }
          });
          return res.json(mainObj);
        });
    } else if (req.body.name) {
      Attendance.find({
        session: session,
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
              new Date(attendance_data.date).valueOf() >=
                new Date(start_date).valueOf() &&
              new Date(attendance_data.date).valueOf() <=
                new Date(end_date).valueOf()
            ) {
              data.push(attendance_data);
            }
          });

          var mainObj = {
            workingDay: [],
            studentDatas: {},
          };
          var studentData = [];
          var classTeacher = "";
          var name = req.body.name;
          var mainName = name.replace(/\s+/g, "");
          data.map(async (data) => {
            if (
              toLower(data.student.firstname + data.student.lastname) ===
              toLower(mainName)
            ) {
              studentData.push(data);
              classTeacher = data.section.classTeacher;
            }
          });
          studentData.map(async (data) => {
            mainObj.studentDatas[
              data.student.firstname +
                " " +
                data.student.lastname +
                "," +
                data.student.SID +
                "," +
                data.student._id
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
            mainObj.studentDatas[
              data.student.firstname +
                " " +
                data.student.lastname +
                "," +
                data.student.SID +
                "," +
                data.student._id
            ].push(data.attendance_status);
          });
          if (req.id == classTeacher) {
            mainObj["classTeacher"] = true;
            mainObj["Today"] = false;
          } else {
            mainObj["classTeacher"] = false;
            mainObj["Today"] = false;
          }
          await data.map(async (data) => {
            if (
              mainObj.studentDatas[
                data.student.firstname +
                  " " +
                  data.student.lastname +
                  "," +
                  data.student.SID +
                  "," +
                  data.student._id
              ].length < mainObj.workingDay.length
            ) {
              let tempData =
                mainObj.studentDatas[
                  data.student.firstname +
                    " " +
                    data.student.lastname +
                    "," +
                    data.student.SID +
                    "," +
                    data.student._id
                ];
              let diff = mainObj.workingDay.length - tempData.length;
              for (let i = 0; i < diff; i++) {
                tempData.unshift("N");
              }
              mainObj.studentDatas[
                data.student.firstname +
                  " " +
                  data.student.lastname +
                  "," +
                  data.student.SID +
                  "," +
                  data.student._id
              ] = tempData;
            }
          });
          return res.json(mainObj);
        });
    } else {
      Attendance.find({
        class: classs,
        section: sections,
        session: session,
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
          var checker = false;
          await attendance.map(async (attendance_data) => {
            if (
              new Date(attendance_data.date).valueOf() >=
                new Date(start_date).valueOf() &&
              new Date(attendance_data.date).valueOf() <=
                new Date(end_date).valueOf()
            ) {
              data.push(attendance_data);
            }
          });
          await attendance.map(async (attendance_data) => {
            if (
              new Date(today).valueOf() ==
              new Date(attendance_data.date).valueOf()
            ) {
              checker = true;
            }
          });
          var mainObj = {
            workingDay: [],
            studentDatas: {},
          };
          var classTeacher = "";
          data.map(async (data) => {
            mainObj.studentDatas[
              data.student.firstname +
                " " +
                data.student.lastname +
                "," +
                data.student.SID +
                "," +
                data.student._id
            ] = [];
            classTeacher = data.section.classTeacher;
          });
          data.map(async (data) => {
            var newDate = data.date.toString();
            mainObj.workingDay.push(
              newDate.slice(8, 10) + "-" + newDate.slice(4, 7)
            );
          });
          const unique = [...new Set(mainObj.workingDay)];
          mainObj.workingDay = unique;
          await data.map(async (data) => {
            mainObj.studentDatas[
              data.student.firstname +
                " " +
                data.student.lastname +
                "," +
                data.student.SID +
                "," +
                data.student._id
            ].push(data.attendance_status);
          });
          if (req.id == classTeacher) {
            mainObj["classTeacher"] = true;
          } else {
            mainObj["classTeacher"] = false;
          }
          if (checker === false) {
            mainObj["Today"] = false;
          } else {
            mainObj["Today"] = true;
          }
          await data.map(async (data) => {
            if (
              mainObj.studentDatas[
                data.student.firstname +
                  " " +
                  data.student.lastname +
                  "," +
                  data.student.SID +
                  "," +
                  data.student._id
              ].length < mainObj.workingDay.length
            ) {
              let tempData =
                mainObj.studentDatas[
                  data.student.firstname +
                    " " +
                    data.student.lastname +
                    "," +
                    data.student.SID +
                    "," +
                    data.student._id
                ];
              let diff = mainObj.workingDay.length - tempData.length;
              for (let i = 0; i < diff; i++) {
                tempData.unshift("N");
              }
              mainObj.studentDatas[
                data.student.firstname +
                  " " +
                  data.student.lastname +
                  "," +
                  data.student.SID +
                  "," +
                  data.student._id
              ] = tempData;
            }
          });
          return res.json(mainObj);
        });
    }
  } catch (error) {
    console.log("getAllAttendance", error);
  }
};

exports.editAttendanceForDate = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    try {
      if (fields.ID) {
        let editAttedance = JSON.parse(fields.editAttedance);
        var check = false;
        await editAttedance.map(async (data) => {
          await Attendance.updateOne(
            {
              school: req.schooldoc._id,
              date: fields.date,
              student: data.id,
            },
            {
              $set: {
                attendance_status: data.attendance_status,
              },
            },
            (err, newData) => {
              if (err) {
                check = true;
              }
            }
          );
        });
        if (check === true) {
          return res.status(400).json({
            err: "Can't Able To Update All Entrys Please Check Again",
          });
        } else {
          return res.status(200).json({
            status: "Update Attendance is Done!",
          });
        }
      } else {
        let editAttedance = JSON.parse(fields.editAttedance);
        var check = false;
        await editAttedance.map(async (data) => {
          await Attendance.updateOne(
            {
              school: req.schooldoc._id,
              date: fields.date,
              class: fields.class,
              section: fields.section,
              student: data.id,
            },
            {
              $set: {
                attendance_status: data.attendance_status,
              },
            },
            (err, newData) => {
              if (err) {
                check = true;
              }
            }
          );
        });
        if (check === true) {
          return res.status(400).json({
            err: "Can't Able To Update All Entrys Please Check Again",
          });
        } else {
          return res.status(200).json({
            status: "Update Attendance is Done!",
          });
        }
      }
    } catch (error) {
      console.log("updateAttendanceForDate", error);
    }
  });
};

exports.deleteAttendance = (req, res) => {
  let attendance = req.attendance;
  try {
    attendance.remove((err, attendance) => {
      if (err || !attendance) {
        return res.status(400).json({
          err: "Can't Able To Delete attendance",
        });
      }
      return res.json({
        Massage: `attendance is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log("deleteAttendance", error);
  }
};
