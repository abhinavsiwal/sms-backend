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
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  getAllStaff,
  getStaffByID,
  updateStaffDocument,
  getStaffFromSID,
  updateStaffPassword,
  getAllStaffAssignHead,
  getAllStaffAssignClassTeacher,
  getStaffByDepartment
} = require("../controller/staff");

//param initialize
router.param("staffID", getStaffByID);
router.param("id", checkToken);
router.param("schooladminID", getSchoolAdminByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/staff/create/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  createStaff
);
router.put(
  "/school/staff/edit/:staffID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateStaff
);
router.put(
  "/school/staff/password/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateStaffPassword
);
router.delete(
  "/school/staff/delete/:staffID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  deleteStaff
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
router.get(
  "/school/staff/get/:staffID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStaff
);
router.get(
  "/school/staff/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllStaff
);
router.get(
  "/school/staff/classTeacher/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllStaffAssignClassTeacher
);
router.get(
  "/school/staff/head/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllStaffAssignHead
);
router.post(
  "/school/staff/department/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getStaffByDepartment
)
//exports all route to main index
module.exports = router;
