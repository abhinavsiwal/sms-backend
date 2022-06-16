//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Session = require("../model/session");

//exports routes controller
exports.getSessionByID = (req, res, next, id) => {
  try {
    Session.findById(id).exec((err, session) => {
      if (err || !session) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.session = session;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createSession = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let session = new Session(fields);
    try {
      session.save((err, session) => {
        if (err) {
          return res.status(400).json({
            err: "Email ID is Already Exits!",
          });
        }
        res.json(session);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getSession = (req, res) => {
  req.json(req.session);
};

exports.updateSession = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let session = req.session;
    session = _.extend(session, fields);

    try {
      session.save((err, session) => {
        if (err) {
          return res.status(400).json({
            err: "Update session in Database is Failed",
          });
        }
        res.json(session);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllSession = (req, res) => {
  try {
    Session.find({ school: req.schooldoc._id })
      .sort({ createdAt: -1 })
      .then(async(session, err) => {
        if (err || !session) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        var date = new Date();

        session.map(async (data) => {
          if (date >= new Date(data.start_date) && date <= data.end_date) {
            data["status"] = "current";
          } else {
            data["status"] = "closed";
          }
        });
        return res.json(session);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteSession = (req, res) => {
  let session = req.session;
  try {
    session.remove((err, session) => {
      if (err || !session) {
        return res.status(400).json({
          err: "Can't Able To Delete session",
        });
      }
      return res.json({
        Massage: `${session.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
