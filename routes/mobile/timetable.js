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
  getTimetable,
  getAllTimetable,
  getAllTimetableByFilter,
  timeTableList
} = require("../../controller/mobile/timetable");
const { getTimetableByID } = require("../../controller/timetable");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("timetableID", getTimetableByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.get(
  "/school/timetable/get/:timetableID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getTimetable
);

router.get(
  "/school/timetable/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllTimetable
);

router.post(
  "/school/timetable/custom/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllTimetableByFilter
);

router.post(
  "/school/timetable/time_table_list/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  timeTableList
);


//exports all route to main index
module.exports = router;
