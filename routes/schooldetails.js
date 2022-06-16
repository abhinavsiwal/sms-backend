//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isAuthenticated,
  isTokenAuthenticated,
  checkToken,
} = require("../controller/auth");
const {
  createSchoolDoc,
  updateSchoolDoc,
  deleteSchoolDoc,
  getSchoolDoc,
  getAllSchoolDoc,
  getSchoolDetailByID,
  changeStatus,
  getAllSchoolDocActive,
  getAllSchoolDocBlock,
  checkAbbreviation,
} = require("../controller/schooldetail");

//require controller module
const { getSuperAdminByID } = require("../controller/superadmin");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
router.param("superadminID", getSuperAdminByID);

//routes
router.post(
  "/school/doc/create/:superadminID",
  isSignedIn,
  isAuthenticated,
  createSchoolDoc
);
router.put(
  "/school/doc/edit/:schoolID/:superadminID",
  isSignedIn,
  isAuthenticated,
  updateSchoolDoc
);
router.delete(
  "/school/doc/delete/:schoolID/:superadminID",
  isSignedIn,
  isAuthenticated,
  deleteSchoolDoc
);
router.post(
  "/school/doc/get/:schoolID/:superadminID",
  isSignedIn,
  isAuthenticated,
  getSchoolDoc
);
router.get(
  "/school/doc/all/:superadminID",
  isSignedIn,
  isAuthenticated,
  getAllSchoolDoc
);
router.get(
  "/school/doc/active/all/:superadminID",
  isSignedIn,
  isAuthenticated,
  getAllSchoolDocActive
);
router.get(
  "/school/doc/block/all/:superadminID",
  isSignedIn,
  isAuthenticated,
  getAllSchoolDocBlock
);
router.post(
  "/school/abbreviation/check/:superadminID",
  isSignedIn,
  isAuthenticated,
  checkAbbreviation
);
router.put(
  "/school/doc/status/change/:schoolID/:superadminID",
  isSignedIn,
  isAuthenticated,
  changeStatus
);
router.get(
  "/school/doc/details/view/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getSchoolDoc
);
router.put(
  "/school/doc/details/edit/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateSchoolDoc
);

//exports all route to main index
module.exports = router;
