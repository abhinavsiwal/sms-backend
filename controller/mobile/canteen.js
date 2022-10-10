//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Canteen = require("../../model/canteen");
const common = require("../../config/common");

//exports routes controller

exports.getCanteen = (req, res) => {

  Canteen.findOne({ _id: req.canteen._id })
    .populate("staff")
    .populate("menu")
    .then((data, err) => {
      if (err || !data) {
        return common.sendJSONResponse(res, 0, "Can't able to find the Canteen Details", null);
      } else {
        return common.sendJSONResponse(res, 1, "Canteen Details fetched successfully", data);
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
          return common.sendJSONResponse(res, 0, "Can't able to find the Canteen Details", null);
        } else {
          return common.sendJSONResponse(res, 1, "Canteen Details fetched successfully", canteen);
        }
      });
  } catch (error) {
    console.log(error);
    return common.sendJSONResponse(res, 0, "Can't able to find the Canteen Details", null);
  }
};
