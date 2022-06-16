//import all require dependencies
const formidable = require("formidable");
const _ = require("lodash");

//import require models
const Payment = require("../model/payments");

//exports routes controller
exports.getPaymentByID = (req, res, next, id) => {
  try {
    Payment.findById(id).exec((err, Payment) => {
      if (err || !Payment) {
        return res.status(400).json({
          err: "No Payment was found in Database",
        });
      }
      req.payment = Payment;
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

exports.createPayment = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data! Please check your data",
      });
    }
    let payment = new Payment(fields);
    try {
      payment.save((err, payment) => {
        if (err) {
          console.log(err)
          return res.status(400).json({
            err: "Error Please Check Your Data!",
          });
        }
        res.json(payment);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getPayment = (req, res) => {
  return res.json(req.payment);
};

exports.updatePayment = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields) => {
    if (err) {
      return res.status(400).json({
        err: "Problem With Data!",
      });
    }

    let payment = req.payment;
    payment = _.extend(payment, fields);
    try {
      payment.save((err, payment) => {
        if (err) {
          return res.status(400).json({
            err: "Update Payment in Database is Failed",
          });
        }
        res.json(payment);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getAllPayment = (req, res) => {
  try {
    Payment.find()
      .sort({ createdAt: -1 })
      .populate('school')
      .then((payment, err) => {
        if (err || !payment) {
          return res.status(400).json({
            err: "Database Dont Have Admin",
          });
        }
        return res.json(payment);
      });
  } catch (error) {
    console.log(error);
  }
};

exports.deletePayment = (req, res) => {
  let payment = req.payment;
  try {
    payment.remove((err, payment) => {
      if (err || !payment) {
        return res.status(400).json({
          err: "Can't Able To Delete payment",
        });
      }
      return res.json({
        Massage: `Deleted SuccessFully`,
      });
    });
  } catch (error) {
    console.log(error);
  }
};
