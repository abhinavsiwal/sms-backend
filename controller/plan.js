//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Plan = require("../model/plan");

//exports routes controller
exports.getPlanByID = (req, res, next, id) => {
  try {
    Plan.findById(id).exec((err, plan) => {
      if (err || !plan) {
        return res.status(400).json({
          err: "No plan was found in Database",
        });
      }
      req.plan = plan;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createPlan = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let plan = new Plan(fields);

    try {
      plan.key_feature = JSON.parse(fields.key_feature);
      plan.module = JSON.parse(fields.module);
      plan.save((err, plan) => {
        if (err) {
          return res.status(400).json({
            err: "Error Please Check Your Data!",
          });
        }
        res.json(plan);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getPlan = (req, res) => {
  return res.json(req.plan);
};

exports.updatePlan = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let plan = req.plan;
    plan = _.extend(plan, fields);

    try {
      if (fields.key_feature) {
        plan.key_feature = JSON.parse(fields.key_feature);
      }
      if (fields.module) {
        plan.module = JSON.parse(fields.module);
      }
      plan.save((err, plan) => {
        if (err) {
          return res.status(400).json({
            err: "Update Plan in Database is Failed",
          });
        }
        res.json(plan);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllPlans = (req, res) => {
  try {
    Plan.find()
      .sort({ createdAt: -1 })
      .then((plan, err) => {
        if (err || !plan) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(plan);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deletePlan = (req, res) => {
  let plan = req.plan;
  try {
    plan.remove((err, plan) => {
      if (err || !plan) {
        return res.status(400).json({
          err: "Can't Able To Delete plan",
        });
      }
      return res.json({
        Massage: `${plan.name} is Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
