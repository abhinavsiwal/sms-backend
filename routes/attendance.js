//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isTokenAuthenticated,
  checkToken,
} = require("../controller/auth");

//require controller module
const {
  updateStudentAttendance,
  updateStaffAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendance,
  getAllAttendance,
  getAttendanceByID,
  getAllAttendanceByFilter,
  editAttendanceForDate,
  getStudentAttandance,
  getStaffAttandance
} = require("../controller/attendance");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("attendanceID", getAttendanceByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/attendance/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createAttendance
);
router.put(
  "/school/attendance/edit/:attendanceID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateAttendance
);
router.put(
  "/school/attendance/date/edit/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  editAttendanceForDate
);
router.delete(
  "/school/attendance/delete/:attendanceID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteAttendance
);
router.get(
  "/school/attendance/get/:attendanceID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAttendance
);
router.get(
  "/school/attendance/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllAttendance
);
router.post(
  "/school/attendance/custom/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllAttendanceByFilter
);


router.post(
  "/school/attendance/update_student_attandance/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStudentAttendance
);


router.post(
  "/school/attendance/update_staff_attandance/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStaffAttendance
);


router.post(
  "/school/attendance/get_student_attandance/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStudentAttandance
);

router.post(
  "/school/attendance/get_staff_attandance/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStaffAttandance
);

//exports all route to main index
module.exports = router;
