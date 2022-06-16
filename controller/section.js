//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Section = require("../model/section");

//exports routes controller
exports.getSectionByID = (req, res, next, id) => {
  try {
    Section.findById(id).exec((err, section) => {
      if (err || !section) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.section = section;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createSection = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    fields.subject = JSON.parse(fields.subject);

    let section = new Section(fields);

    try {
      Section.findOne(
        { name: fields.name, class: fields.class, school: fields.school },
        (err, data) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              err: "Please Check Data!",
            });
          }
          if (data) {
            return res.status(400).json({
              err: "Section Name is Already Used Please Change Name",
            });
          }
          if (!data) {
            section.save((err, section) => {
              if (err) {
                return res.status(400).json({
                  err: "Please Check Your Data",
                });
              }
              res.json(section);
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getSection = (req, res) => {
  Section.findOne({ _id: req.section._id })
    .populate("class")
    .populate("classTeacher")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Section Detail",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.updateSection = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    if (
      fields.removeClassTeacher === true ||
      fields.removeClassTeacher !== undefined
    ) {
      Section.updateOne(
        { _id: fields.id },
        { $unset: { classTeacher: 1 } }
      ).then((doc, err) => {
        if (err || !doc) {
          return res.status(400).json({
            err: "Database Dont Have department",
          });
        }
        var status = { status: true };
        return res.json(status);
      });
    } else {
      let section = req.section;
      section = _.extend(section, fields);

      try {
        if (fields.subject) {
          section.subject = JSON.parse(fields.subject);
        }
        section.save((err, section) => {
          if (err) {
            return res.status(400).json({
              err: "Update section in Database is Failed",
            });
          }
          res.json(section);
        });
      } catch (error) {
        console.log(error);
      }
    }
  });
};

exports.getAllSection = (req, res) => {
  try {
    Section.find({ school: req.schooldoc._id })
      .populate("class")
      .populate("classTeacher")
      .sort({ createdAt: -1 })
      .then((section, err) => {
        if (err || !section) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(section);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteSection = (req, res) => {
  let section = req.section;
  try {
    section.remove((err, section) => {
      if (err || !section) {
        return res.status(400).json({
          err: "Can't Able To Delete section",
        });
      }
      return res.json({
        Massage: `${section.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
