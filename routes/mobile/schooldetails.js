//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isTokenAuthenticated,
  checkToken,
} = require("../../controller/auth");
const { getSchoolDoc } = require("../../controller/mobile/schooldetails");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//require controller module
const { getSuperAdminByID } = require("../../controller/superadmin");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
router.param("superadminID", getSuperAdminByID);

//routes
router.get(
  "/school/doc/get/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getSchoolDoc
);

//exports all route to main index
module.exports = router;
