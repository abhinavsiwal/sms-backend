//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Attendance = require("../model/staffAttendance");
const Staff = require("../model/staff");
//exports routes controller
exports.getAttendanceByID = (req, res, next, id) => {
  try {
    Attendance.findById(id).exec((err, attendance) => {
      if (err || !attendance) {
        return res.status(400).json({
          err: "No Attendance was found in Database",
        });
      }
      req.staffAttendance = attendance;
      next();
    });
  } catch (error) {
    console.log("getAttendanceByID", error);
  }
};

exports.createAttendance = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    console.log(fields);

    try {
      var attendance = JSON.parse(fields.attendance);
      Attendance.find({
        staff: attendance[0].staff,
        date: attendance[0].date,
      }).then(async (attendance_one, err) => {
        if (attendance_one.length > 0) {
          return res.status(400).json({
            err: "Attendance Can't Be Repeat Please Check Your Data!",
          });
        } else {
          Attendance.insertMany(attendance, (err, attendances) => {
            if (err || !attendances) {
              console.log(err);
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
  res.json(req.staffAttendance);
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
    let attendance = req.attendance;
    attendance = _.extend(attendance, fields);
    try {
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

exports.getAllAttendanceByFilter = async (req, res) => {
  const { department, start_date, end_date, session } = req.body;
  console.log(department, start_date, end_date, session);
  let today = req.body.today_date;
  // console.log(req.body);
  var data = [];
  var checker = false;

  try {
    Attendance.find({
      department: department,
      school: req.schooldoc._id,
      session: session,
    })
      .sort({ createdAt: 1 })
      .populate("staff")
      .populate("department")
      .then(async (attendance, err) => {
        console.log(attendance);
        if (err || !attendance) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }

        await attendance.map(async (attendance_data) => {
          if (
            new Date(attendance_data.date).setHours(0, 0, 0) >=
              new Date(start_date).setHours(0, 0, 0) &&
            new Date(attendance_data.date).setHours(0, 0, 0) <=
              new Date(end_date).setHours(0, 0, 0)
          ) {
            console.log("here");
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
        let mainObj = {
          workingDay: [],
          staffDatas: {},
        };
        data.map(async (data) => {
          mainObj.staffDatas[
            data.staff.firstname +
              " " +
              data.staff.lastname +
              "," +
              data.staff.SID +
              "," +
              data.staff._id
          ] = [];
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
          mainObj.staffDatas[
            data.staff.firstname +
              " " +
              data.staff.lastname +
              "," +
              data.staff.SID +
              "," +
              data.staff._id
          ].push(data.attendance_status);
        });
        if (checker === false) {
          mainObj["Today"] = false;
        } else {
          mainObj["Today"] = true;
        }
        await data.map(async (data) => {
          if (
            mainObj.staffDatas[
              data.staff.firstname +
                " " +
                data.staff.lastname +
                "," +
                data.staff.SID +
                "," +
                data.staff._id
            ].length < mainObj.workingDay.length
          ) {
            let tempData =
              mainObj.staffDatas[
                data.staff.firstname +
                  " " +
                  data.staff.lastname +
                  "," +
                  data.staff.SID +
                  "," +
                  data.staff._id
              ];
            let diff = mainObj.workingDay.length - tempData.length;
            for (let i = 0; i < diff; i++) {
              tempData.unshift("N");
            }
            mainObj.staffDatas[
              data.staff.firstname +
                " " +
                data.staff.lastname +
                "," +
                data.staff.SID +
                "," +
                data.staff._id
            ] = tempData;
          }
        });
        return res.json(mainObj);
      });
  } catch (error) {
    console.log("getAllAttendance", error);
  }
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
              department: fields.department,
              staff: data.id,
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
          await Attendance.findOne({
            school: req.schooldoc._id,
            date: new Date(fields.date),
            department: fields.department,
            staff: data.id,
            session: fields.session,
          },(err,data)=>{
            console.log(data)
          });
          await Attendance.updateOne(
            {
              school: req.schooldoc._id,
              date: fields.date,
              department: fields.department,
              staff: data.id,
              session: fields.session,
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
