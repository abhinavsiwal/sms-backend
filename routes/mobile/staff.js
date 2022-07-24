//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isSchoolAdminAuthenticated,
  isTokenAuthenticated,
  checkToken,
} = require("../../controller/auth");

//require controller module
const { getSchoolAdminByID } = require("../../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../../controller/schooldetail");
const { getStaffByID } = require("../../controller/staff");
const {
  getStaff,
  getAllStaff,
  updateStaffDocument,
  getStaffFromSID,
  updateStaffPassword,
  getStaffByDepartment
} = require("../../controller/mobile/staff");

//param initialize
router.param("staffID", getStaffByID);
router.param("id", checkToken);
router.param("schooladminID", getSchoolAdminByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.put(
  "/school/staff/password/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateStaffPassword
);
router.get(
  "/school/staff/search/SID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStaffFromSID
);
router.put(
  "/school/staff/document/:staffID/:id",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateStaffDocument
);
router.get("/school/staff/get/:staffID", isSignedIn, getStaff);
router.post(
  "/school/staff/department/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStaffByDepartment
)

router.get(
  "/school/staff/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllStaff
);

//exports all route to main index
module.exports = router;
