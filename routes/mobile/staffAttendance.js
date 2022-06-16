//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isTokenAuthenticated,
  checkToken,
} = require("../../controller/auth");

//require controller module
const {
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendance,
  getAllAttendance,
  getAttendanceByID,
  getAllAttendanceByFilter,
  editAttendanceForDate
} = require("../../controller/mobile/staffAttendance");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("staffAttendanceID", getAttendanceByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/staffAttendance/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createAttendance
);
router.put(
  "/school/staffAttendance/date/edit/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  editAttendanceForDate
);
router.delete(
  "/school/staffAttendance/delete/:staffAttendanceID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteAttendance
); 
router.post(
  "/school/staffAttendance/get/:staffAttendanceID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAttendance
);
router.get(
  "/school/staffAttendance/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllAttendance
);
router.post(
  "/school/staffAttendance/custom/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllAttendanceByFilter
);

//exports all route to main index
module.exports = router;
