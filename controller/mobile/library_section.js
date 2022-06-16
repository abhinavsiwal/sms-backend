//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Librariesection = require("../../model/librarie_section");

//exports routes controller
exports.getLibrariesectionByID = (req, res, next, id) => {
  try {
    Librariesection.findById(id).exec((err, librariesection) => {
      if (err || !librariesection) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.librariesection = librariesection;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createLibrariesection = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let librariesection = new Librariesection(fields);
    try {
      librariesection.save((err, librariesection) => {
        if (err) {
          return res.status(400).json({
            err: "Please Check Data!",
          });
        }
        res.json(librariesection);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getLibrariesection = (req, res) => {
  req.json(req.librariesection);
};

exports.updateLibrariesection = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    try {
      let librariesection = req.librariesection;
      if (fields.section) {
        librariesection.section = JSON.parse(fields.section);
      }
      librariesection = _.extend(librariesection, fields);
      librariesection.save((err, librariesection) => {
        if (err) {
          return res.status(400).json({
            err: "Update librariesection in Database is Failed",
          });
        }
        res.json(librariesection);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllLibrariesection = (req, res) => {
  try {
    Librariesection.find({ school: req.schooldoc._id })
      .sort({ createdAt: -1 })
      .populate("shelf")
      .then((librariesection, err) => {
        if (err || !librariesection) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(librariesection);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.updateShelfLibrariesection = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    } else {
      try {
        Librariesection.findOneAndUpdate(
          { school: fields.school },
          { $push: { shelf: fields.shelf } }
        )
          .sort({ createdAt: -1 })
          .then((librariesection, err) => {
            if (err || !librariesection) {
              return res.status(400).json({
                err: "Database Don't Have Librariesectiones",
              });
            }
            return res.json(librariesection);
          });
      } catch (error) {
        console.log(error);
      }
    }
  });
};

exports.deleteLibrariesection = (req, res) => {
  let librariesection = req.librariesection;
  try {
    librariesection.remove((err, librariesection) => {
      if (err || !librariesection) {
        return res.status(400).json({
          err: "Can't Able To Delete librariesection",
        });
      }
      return res.json({
        Massage: `${librariesection.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
