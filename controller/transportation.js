//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Transportation = require("../model/transportation");

//exports routes controller
exports.getTransportationByID = (req, res, next, id) => {
  try {
    Transportation.findById(id).exec((err, transportation) => {
      if (err || !transportation) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.transportation = transportation;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createTransportation = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let transportation = new Transportation(fields);
    try {
      if (fields.staff) {
        transportation.staff = JSON.parse(fields.staff);
      }
      if (fields.stops) {
        transportation.stops = JSON.parse(fields.stops);
      }
      transportation.save((err, transportation) => {
        if (err) {
          return res.status(400).json({
            err: "Please Check Data!",
          });
        }
        res.json(transportation);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.AddStop = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    try {
      let stop = JSON.parse(fields.stops);
      Transportation.findOneAndUpdate(
        { _id: fields.id },
        {  stops: stop  },
        { new: true }
      ).then((data, err) => {
        if (err) {
          return res.status(400).json({
            err: "Insert Stop in Route is Failed",
          });
        } else {
          return res.json(data);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getTransportation = (req, res) => {
  req.json(req.transportation);
};

exports.updateTransportation = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let transportation = req.transportation;
    transportation = _.extend(transportation, fields);
    try {
      if (fields.staff) {
        transportation.staff = JSON.parse(fields.staff);
      }
      if (fields.stop) {
        transportation.stops = JSON.parse(fields.stop);
      }
      transportation.save((err, transportation) => {
        if (err) {
          return res.status(400).json({
            err: "Update transportation in Database is Failed",
          });
        }
        res.json(transportation);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllTransportation = (req, res) => {
  try {
    Transportation.find({ school: req.schooldoc._id })
      .populate("staff")
      .populate("session")
      .sort({ createdAt: -1 })
      .then((transportation, err) => {
        if (err || !transportation) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(transportation);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteTransportation = (req, res) => {
  let transportation = req.transportation;
  try {
    transportation.remove((err, transportation) => {
      if (err || !transportation) {
        return res.status(400).json({
          err: "Can't Able To Delete transportation",
        });
      }
      return res.json({
        Massage: `${transportation.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
