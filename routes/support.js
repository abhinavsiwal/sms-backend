//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isSchoolAdminAuthenticated,
  isAuthenticated,
} = require("../controller/auth");

//require controller module
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const {
  createSupport,
  updateSupport,
  deleteSupport,
  getSupport,
  getAllSupports,
  getSupportByID,
  getAllSupportForSchool,
} = require("../controller/support");
const { getSuperAdminByID } = require("../controller/superadmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("supportID", getSupportByID);
router.param("schoolID", getSchoolDetailByID);
router.param("schooladminID", getSchoolAdminByID);
router.param("superadminID", getSuperAdminByID);

//routes
router.post(
  "/school/support/create/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  createSupport
);
router.put(
  "/school/suppot/edit/:supportID/:superadminID",
  isSignedIn,
  isAuthenticated,
  updateSupport
);
router.delete(
  "/school/section/delete/:supportID/:superadminID",
  isSignedIn,
  isAuthenticated,
  deleteSupport
);
router.post(
  "/school/section/get/:supportID/:superadminID",
  isSignedIn,
  isAuthenticated,
  getSupport
);
router.get(
  "/school/support/all/:superadminID",
  isSignedIn,
  isAuthenticated,
  getAllSupports
);

router.get(
  "/school/support/details/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllSupportForSchool
);

//exports all route to main index
module.exports = router;
