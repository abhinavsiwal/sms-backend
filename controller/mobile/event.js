//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Event = require("../../model/event");

//exports routes controller

exports.getEvent = (req, res) => {
  Event.findOne({ _id: req.event._id })
    .populate("assignTeachers")
    .populate("school")
    .populate("session")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Events",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.getAllEvent = (req, res) => {
  try {
    Event.find({ school: req.schooldoc._id })
      .populate("assignTeachers")
      .populate("session")
      .populate("school")
      .sort({ createdAt: -1 })
      .then((event, err) => {
        if (err || !event) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(event);
      });
  } catch (error) {
    console.log(error);
  }
};


exports.createEvent = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }

    try {
      let event = new Event(fields);
      event.save((err, event) => {
        if (err) {
          return res.status(400).json({
            err: "Please Check Data!",
          });
        }
        res.json(event);
      });
    } catch (error) {
      console.log(error);
    }
  });
};