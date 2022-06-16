//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");
var aws = require("aws-sdk");
const fs = require("fs");
//import require models
const Menu = require("../model/menu");
const Canteen = require("../model/canteen");

//s3 aws
aws.config.update({
  accessKeyId: process.env.accessKeyID,
  secretAccessKey: process.env.secretAccessID,
  region: process.env.region,
});
const s3 = new aws.S3();

//s3 upload file function
function uploadFile(file, name, type) {
  const params = {
    Bucket: process.env.Bucket,
    Body: file,
    Key: `MenuImages/${name}`,
    ContentEncoding: "base64",
    ContentType: type,
  };
  return s3.upload(params).promise();
}

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
exports.getMenuByID = (req, res, next, id) => {
  try {
    Menu.findById(id).exec((err, menu) => {
      if (err || !menu) {
        return res.status(400).json({
          err: "No Menu was found in Database",
        });
      }
      req.menu = menu;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createMenu = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    try {
      if (file.image) {
        var content = await fs.readFileSync(file.image.filepath);
        var photo_result = await uploadFile(
          content,
          file.image.originalFilename,
          file.image.mimetype
        );
        fields.image = photo_result.Key;
      }
      let menu = new Menu(fields);
      menu.save((err, menu) => {
        if (err) {
          return res.status(400).json({
            err: "Please Check Data!",
          });
        }
        Canteen.updateOne(
          { _id: menu.canteen },
          { $push: { menu: menu._id } },
          (err, canteen) => {
            if (err) {
              return res.status(400).json({
                err: "Please Check Data!",
              });
            } else {
              res.json(menu);
            }
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getMenu = (req, res) => {
  req.json(req.menu);
};

exports.updateMenu = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }
    let menu = req.menu;
    menu = _.extend(menu, fields);
    if (file.image) {
      var content = await fs.readFileSync(file.image.filepath);
      var photo_result = await uploadFile(
        content,
        file.image.originalFilename,
        file.image.mimetype
      );
      menu.image = photo_result.Key;
    }
    try {
      menu.save((err, menu) => {
        if (err) {
          return res.status(400).json({
            err: "Update menu in Database is Failed",
          });
        }
        res.json(menu);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllMenu = (req, res) => {
  try {
    Menu.find({ school: req.schooldoc._id })
      .populate("canteen")
      .sort({ createdAt: -1 })
      .then(async (menu, err) => {
        if (err || !menu) {
          return res.status(400).json({
            err: "Database Dont Have Menu",
          });
        }
        for (let i = 0; i < menu.length; i++) {
          let temp = await getFileStream(menu[i].image);
          menu[i].tempPhoto = temp;
        }
        return res.json(menu);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.getAllMenuByCanteen = (req, res) => {
  try {
    Menu.find({ canteen: req.canteen._id })
      .populate("canteen")
      .sort({ createdAt: -1 })
      .then(async (menu, err) => {
        if (err || !menu) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        for (let i = 0; i < menu.length; i++) {
          let temp = await getFileStream(menu[i].image);
          menu[i].tempPhoto = temp;
        }
        return res.json(menu);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteMenu = (req, res) => {
  let menu = req.menu;
  try {
    menu.remove((err, menu) => {
      if (err || !menu) {
        return res.status(400).json({
          err: "Can't Able To Delete menu",
        });
      }
      Canteen.findOne({ _id: menu.canteen }, (err, canteen) => {
        if (err || !canteen) {
          return res.status(400).json({
            err: "Can't Able to Find The Canteen For Menu Delete!",
          });
        }
        canteen.menu.splice(canteen.menu.indexOf(menu._id), 1);
        Canteen.updateOne(
          { _id: menu.canteen },
          { $set: { menu: canteen.menu } },
          (err, canteen_data) => {
            if (err) {
              return res.status(400).json({
                err: "Can't Able to Delete Menu From The Canteen!",
              });
            } else {
              return res.json({
                Massage: `${menu.item} is Deleted SuccessFully`,
              });
            }
          }
        );
      });
    });
  } catch (error) {
    console.log(error);
  }
};
