//import require models
const Transportation = require("../../model/transportation");

//exports routes controller

exports.getTransportation = (req, res) => {
  Transportation.findOne({ _id: req.transportation._id })
    .populate("staff")
    .populate("session")
    .then((data, err) => {
      if (err || !data) {
        return res.status(400).json({
          err: "Can't able to find the Transportation Details",
        });
      } else {
        return res.json(data);
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
            err: "Database Dont Have Data for transportation",
          });
        }
        return res.json(transportation);
      });
  } catch (error) {
    console.log(error);
  }
};
