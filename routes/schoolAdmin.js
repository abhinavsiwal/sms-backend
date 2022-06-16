//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const { isSignedIn, isAuthenticated, isOwner } = require("../controller/auth");
const {
  getSchoolAdminByID,
  createSchoolAdmin,
  updateSchoolAdmin,
  deleteSchoolAdmin,
  getSchoolAdmin,
  getAllSchoolAdmin,
} = require("../controller/schoolAdmin");

//require controller module
const { getSuperAdminByID } = require("../controller/superadmin");

//param initialize
router.param("schooladminID", getSchoolAdminByID);
router.param("superadminID", getSuperAdminByID);

//routes
router.post(
  "/school/admin/create/:superadminID",
  isSignedIn,
  isAuthenticated,
  createSchoolAdmin
);
router.put(
  "/school/admin/edit/:schooladminID/:superadminID",
  isSignedIn,
  isAuthenticated,
  updateSchoolAdmin
);
router.put(
  "/school/admin/detail/edit/:schooladminID",
  isSignedIn,
  updateSchoolAdmin
);
router.delete(
  "/school/admin/delete/:schooladminID/:superadminID",
  isSignedIn,
  isAuthenticated,
  deleteSchoolAdmin
);
router.post(
  "/school/admin/get/:schooladminID/:superadminID",
  isSignedIn,
  isAuthenticated,
  getSchoolAdmin
);
router.get(
  "/school/admin/details/get/:schooladminID",
  isSignedIn,
  getSchoolAdmin
);
router.get(
  "/school/admin/all/:superadminID",
  isSignedIn,
  isAuthenticated,
  getAllSchoolAdmin
);

//exports all route to main index
module.exports = router;
