//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const { isSignedIn, isAuthenticated, isOwner } = require("../controller/auth");
const {
  createPayment,
  updatePayment,
  deletePayment,
  getPayment,
  getAllPayment,
  getPaymentByID,
} = require("../controller/payments");

//require controller module
const { getSuperAdminByID } = require("../controller/superadmin");

//param initialize
router.param("paymentsID", getPaymentByID);
router.param("superadminID", getSuperAdminByID);

//routes
router.post(
  "/admin/payment/create/:superadminID",
  isSignedIn,
  isAuthenticated,
  createPayment
);
router.put(
  "/admin/payment/edit/:paymentsID/:superadminID",
  isSignedIn,
  isAuthenticated,
  updatePayment
);
router.delete(
  "/admin/payment/delete/:paymentsID/:superadminID",
  isSignedIn,
  isAuthenticated,
  deletePayment
);
router.post(
  "/admin/payment/get/:paymentsID/:superadminID",
  isSignedIn,
  isAuthenticated,
  getPayment
);
router.get(
  "/admin/payment/all/:superadminID",
  isSignedIn,
  isAuthenticated,
  getAllPayment
);

//exports all route to main index
module.exports = router;
