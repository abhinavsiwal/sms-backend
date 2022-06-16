//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Librarieshelf = require("../../model/librarie_shelf");
const Librariesection = require("../../model/librarie_section");

//exports routes controller
exports.getLibrarieshelfByID = (req, res, next, id) => {
  try {
    Librarieshelf.findById(id).exec((err, librarieshelf) => {
      if (err || !librarieshelf) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.librarieshelf = librarieshelf;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createLibrarieshelf = async (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let librarieshelf = new Librarieshelf(fields);

    try {
      // librarieshelf.subject = JSON.parse(fields.subject);

      librarieshelf.save(async (err, librarieshelf) => {
        if (err) {
          return res.status(400).json({
            err: "Shelf Already Exits!",
          });
        }
        const shelf = await Librariesection.updateOne(
          { _id: fields.section },
          { $push: { shelf: librarieshelf._id } },
          { new: true }
        );
        res.json(librarieshelf);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getLibrarieshelf = (req, res) => {
  req.json(req.librarieshelf);
};

exports.updateLibrarieshelf = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let librarieshelf = req.librarieshelf;
    librarieshelf = _.extend(librarieshelf, fields);

    try {
      if (fields.subject) {
        librarieshelf.subject = JSON.parse(fields.subject);
      }
      librarieshelf.save((err, librarieshelf) => {
        if (err) {
          return res.status(400).json({
            err: "Update librarieshelf in Database is Failed",
          });
        }
        res.json(librarieshelf);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllLibrarieshelf = (req, res) => {
  try {
    Librarieshelf.find({ school: req.schooldoc._id })
      .populate("section")
      .sort({ createdAt: -1 })
      .then((librarieshelf, err) => {
        if (err || !librarieshelf) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(librarieshelf);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteLibrarieshelf = (req, res) => {
  let librarieshelf = req.librarieshelf;
  try {
    librarieshelf.remove((err, librarieshelf) => {
      if (err || !librarieshelf) {
        return res.status(400).json({
          err: "Can't Able To Delete librarieshelf",
        });
      }
      return res.json({
        Massage: `${librarieshelf.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
