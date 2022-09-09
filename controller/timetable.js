//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Timetable = require("../model/timetable");

//exports routes controller
exports.getTimetableByID = (req, res, next, id) => {
  try {
    Timetable.findById(id).exec((err, timetable) => {
      if (err || !timetable) {
        return res.status(400).json({
          err: "No TimeTable was found in Database",
        });
      } 
      req.timetable = timetable;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createTimetable = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let timetable = new Timetable(fields);
    try {
      timetable.lecture = JSON.parse(fields.lecture);
      timetable.timeSlots = JSON.parse(fields.timeSlots);
      timetable.working_day = JSON.parse(fields.working_day);
      timetable.save((err, timetable) => {
        if (err) {
          return res.status(400).json({
            err: "Please check your data!",
          });
        }
        res.json(timetable);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getTimetable = (req, res) => {
  req.json(req.timetable);
};

exports.updateTimetable = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let timetable = req.timetable;
    timetable = _.extend(timetable, fields);
    try {
      if (fields.lecture) {
        timetable.lecture = JSON.parse(fields.lecture);
      }
      timetable.save((err, timetable) => {
        if (err) {
          return res.status(400).json({
            err: "Update timetable in Database is Failed",
          });
        }
        res.json(timetable);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllTimetable = (req, res) => {
  try {
    Timetable.find({ school: req.schooldoc._id })
      .populate("class")
      .populate("section")
      .sort({ createdAt: -1 })
      .then((timetable, err) => {
        if (err || !timetable) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(timetable);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllTimetableByFilter = (req, res) => {
  let classs = req.body.class;
  let sections = req.body.section;
  try {
    Timetable.findOne({
      class: classs,
      section: sections,
      school: req.schooldoc._id,
    })
      .populate("class")
      .populate("section")
      .sort({ createdAt: -1 })
      .then((timetable, err) => {
        if (err) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(timetable);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteTimetable = (req, res) => {
  let timetable = req.timetable;
  try {
    timetable.remove((err, timetable) => {
      if (err || !timetable) {
        return res.status(400).json({
          err: "Can't Able To Delete timetable",
        });
      }
      return res.json({
        Massage: `timetable is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
