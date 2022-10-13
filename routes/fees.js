//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isSchoolAdminAuthenticated,
  isTokenAuthenticated,
  checkToken,
} = require("../controller/auth");

//require controller module
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");
const {
  createFees,
  updateFees,
  deleteFees,
  getAllFees,
  getFeesByID,
  getAllFeesCustome,
  getAllFeesObject,
} = require("../controller/fees");

//param initialize
router.param("feesID", getFeesByID);
router.param("id", checkToken);
router.param("schooladminID", getSchoolAdminByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/fees/create/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  createFees
);
router.post(
  "/school/fees/custome/get/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllFeesCustome
);
router.post(
  "/school/fees/object/all/get/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllFeesObject
);
router.put(
  "/school/fees/fees/:feesID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateFees
);
router.delete(
  "/school/fees/delete/:feesID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  deleteFees
);
router.get(
  "/school/fees/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllFees
);

router.put(
  "/school/fees/update_avail_fees/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllFees
);
//exports all route to main index
module.exports = router;
