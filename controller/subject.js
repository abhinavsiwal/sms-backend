//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Subject = require("../model/subject");

//exports routes controller
exports.getSubjectByID = (req, res, next, id) => {
  try {
    Subject.findById(id).exec((err, subject) => {
      if (err || !subject) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.subject = subject;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createSubject = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {

    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    } else {
      var subject = new Subject(fields);
      try {
        if (fields.type === "Group") {
          subject.list = JSON.parse(fields.list);
        }
        Subject.findOne(
          { name: fields.name, school: fields.school },
          (err, data) => {
            if (err) {
              console.log(err);
              return res.status(400).json({
                err: "Please Check Data!",
              });
            }
            if (data) {
              return res.status(400).json({ 
                err: "Subject Name is Already Used Please Change Name",
              });
            }
            if (!data) {
              subject.save((err, subject) => {
                if (err) {
                  return res.status(400).json({
                    err: "Update subject in Database is Failed",
                  });
                }
                res.json(subject);
              });
            }
          }
        );
      } catch (error) {
        console.log(error);
      }
    }
  });
};

exports.getSubject = (req, res) => {
  req.json(req.subject);
};

exports.updateSubject = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    console.log(fields)
    let subject = req.subject;
    subject = _.extend(subject, fields);
    try {
      subject.list = JSON.parse(fields.list);
      subject.save((err, subject) => {
        if (err) {
          return res.status(400).json({
            err: "Update subject in Database is Failed",
          });
        }
        res.json(subject);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllSubject = (req, res) => {
  try {
    Subject.find({ school: req.schooldoc._id })
      .populate("session")
      .sort({ createdAt: -1 })
      .then((subject, err) => {
        if (err || !subject) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(subject);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteSubject = (req, res) => {
  let subject = req.subject;
  try {
    subject.remove((err, subject) => {
      if (err || !subject) {
        return res.status(400).json({
          err: "Can't Able To Delete subject",
        });
      }
      return res.json({
        Massage: `${subject.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
