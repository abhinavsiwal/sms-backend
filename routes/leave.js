//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isTokenAuthenticated,
  isSchoolAdminAuthenticated,
  checkToken,
} = require("../controller/auth");
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");

const {
  createLeave,
  getLeaveBySID,
  deleteLeaveById,
  getAllLeaves,
  getAllStaffLeaves,
  getAllStudentLeaves,
  getLeavesByStaff,
  editLeave,
} = require("../controller/leave");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
router.param("schooladminID", getSchoolAdminByID);

//routes
router.post(
  "/school/leave/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createLeave
);

router.get(
  "/school/leave/get/:id/:sId",
  isSignedIn,
  isTokenAuthenticated,
  getLeaveBySID
);

router.delete(
  "/school/leave/delete/:leaveId/:sId/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteLeaveById
);

router.get(
  "/school/leave/get/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllLeaves
);

router.get(
  "/school/leave/staff/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllStaffLeaves
);
router.get(
  "/school/leave/student/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllStudentLeaves
);
router.get(
  "/school/leave/staff/:id/:sId",
  isSignedIn,
  isTokenAuthenticated,
  getLeavesByStaff
);

router.put(
  "/school/leave/edit/:id",
  isSignedIn,
  isTokenAuthenticated,
  editLeave
);
//exports all route to main index
module.exports = router;
