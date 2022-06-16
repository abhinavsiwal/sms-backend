//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
var aws = require("aws-sdk");

//import require models
const Canteen = require("../model/canteen");

//s3 aws
aws.config.update({
  accessKeyId: process.env.accessKeyID,
  secretAccessKey: process.env.secretAccessID,
  region: process.env.region,
});
const s3 = new aws.S3();

async function getFileStream(key) {
  try {
    const downloadparams = {
      Bucket: process.env.Bucket,
      Key: key,
      Expires: 604800,
    };
    var data = await s3.getSignedUrlPromise("getObject", downloadparams);
    return data;
  } catch (error) {
    return 2;
  }
}

//exports routes controller
exports.getCanteenByID = (req, res, next, id) => {
  try {
    Canteen.findById(id).exec((err, canteen) => {
      if (err || !canteen) {
        return res.status(400).json({
          err: "No School Admin was found in Database",
        });
      }
      req.canteen = canteen;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createCanteen = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let canteen = new Canteen(fields);
    try {
      canteen.staff = JSON.parse(fields.staff);
      Canteen.findOne(
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
              err: "Canteen Name is Already Used Please Change Name",
            });
          }
          if (!data) {
            canteen.save((err, canteen) => {
              if (err) {
                return res.status(400).json({
                  err: "Please Check Data!",
                });
              }
              res.json(canteen);
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  });
};

exports.AddMenu = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    try {
      let add_menu = JSON.parse(fields.menu);
      Canteen.findOneAndUpdate(
        { _id: fields.id, school: fields.school },
        { $push: { menu: add_menu } },
        { new: true }
      ).then((data, err) => {
        if (err) {
          return res.status(400).json({
            err: "Insert Menu in canteen is Failed",
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

exports.getCanteen = (req, res) => {
  req.json(req.canteen);
};

exports.updateCanteen = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let canteen = req.canteen;
    canteen = _.extend(canteen, fields);
    try {
      if (fields.staff) {
        canteen.staff = JSON.parse(fields.staff);
      }
      if (fields.menu) {
        canteen.menu = JSON.parse(fields.menu);
      }
      canteen.save((err, canteen) => {
        if (err) {
          return res.status(400).json({
            err: "Update canteen in Database is Failed",
          });
        }
        res.json(canteen);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllCanteen = (req, res) => {
  try {
    Canteen.find({ school: req.schooldoc._id })
      .populate("staff")
      .populate("menu")
      .sort({ createdAt: -1 })
      .then(async(canteen, err) => {
        if (err || !canteen) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        for(let j =0;j<canteen.length;j++){
          for (let i = 0; i < canteen[j].menu.length; i++) {
            let temp = await getFileStream(canteen[j].menu[i].image);
            canteen[j].menu[i].tempPhoto = temp;
          }
        }
        return res.json(canteen);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.updateSectionCanteen = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    } else {
      try {
        Canteen.findOneAndUpdate(
          { school: fields.school },
          { $push: { section: fields.section } }
        )
          .sort({ createdAt: -1 })
          .then((canteen, err) => {
            if (err || !canteen) {
              return res.status(400).json({
                err: "Database Don't Have Canteenes",
              });
            }
            return res.json(canteen);
          });
      } catch (error) {
        console.log(error);
      }
    }
  });
};

exports.deleteCanteen = (req, res) => {
  let canteen = req.canteen;
  try {
    canteen.remove((err, canteen) => {
      if (err || !canteen) {
        return res.status(400).json({
          err: "Can't Able To Delete canteen",
        });
      }
      return res.json({
        Massage: `${canteen.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
