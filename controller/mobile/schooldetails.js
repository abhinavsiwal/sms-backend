//import all require dependencies
const key = process.env.my_secret;
//import require models
const schoolDetail = require("../../model/schooldetail");
//exports routes controller

exports.getSchoolDoc = (req, res) => {
  schoolDetail.findOne({ _id: req.schooldoc._id }).then((data, err) => {
    if (err || !data) {
      return res.status(400).json({
        err: "Can't able to find the School Details",
      });
    } else {
      return res.json(data);
    }
  });
};
