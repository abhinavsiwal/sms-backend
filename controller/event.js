//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Event = require("../model/event");

//exports routes controller
exports.getEventByID = (req, res, next, id) => {
  try {
    Event.findById(id).exec((err, event) => {
      if (err || !event) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.event = event;
      next();
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

exports.getEvent = (req, res) => {
  req.json(req.event);
};

exports.updateEvent = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    try {
      let event = req.event;
      event = _.extend(event, fields);
      event.save((err, event) => {
        if (err) {
          return res.status(400).json({
            err: "Update event in Database is Failed",
          });
        }
        res.json(event);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllEvent = (req, res) => {
  try {
    Event.find({ school: req.schooldoc._id })
      .populate("assignTeachers")
      .populate("session")
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

exports.updateSectionEvent = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    } else {
      try {
        Event.findOneAndUpdate(
          { school: fields.school },
          { $push: { section: fields.section } }
        )
          .sort({ createdAt: -1 })
          .then((event, err) => {
            if (err || !event) {
              return res.status(400).json({
                err: "Database Don't Have Event",
              });
            }
            return res.json(event);
          });
      } catch (error) {
        console.log(error);
      }
    }
  });
};

exports.deleteEvent = (req, res) => {
  let event = req.event;
  try {
    event.remove((err, event) => {
      if (err || !event) {
        return res.status(400).json({
          err: "Can't Able To Delete event",
        });
      }
      return res.json({
        Massage: `${event.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
