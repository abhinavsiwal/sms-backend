//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Canteen = require("../../model/canteen");

//exports routes controller

exports.getCanteen = (req, res) => {
  Canteen.findOne({ _id: req.canteen._id })
    .populate("staff")
    .populate("menu")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Canteen Details",
        });
      } else {
        return res.json(data);
      }
    });
};

exports.getAllCanteen = (req, res) => {
  try {
    Canteen.find({ school: req.schooldoc._id })
      .populate("staff")
      .populate("menu")
      .sort({ createdAt: -1 })
      .then((canteen, err) => {
        if (err || !canteen) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(canteen);
      });
  } catch (error) {
    console.log(error);
  }
};
