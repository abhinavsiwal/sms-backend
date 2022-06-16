//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Timetable = require("../../model/timetable");

//exports routes controller

exports.getTimetable = (req, res) => {
  Timetable.findOne({ _id: req.timetable._id })
    .populate("class")
    .populate("section")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the TimeTable Details",
        });
      } else {
        return res.json(data);
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
