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
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetable,
  getAllTimetable,
  getTimetableByID,
  getAllTimetableByFilter
} = require("../controller/timetable");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("timetableID", getTimetableByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/timetable/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createTimetable
);
router.put(
  "/school/timetable/edit/:timetableID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateTimetable
);
router.delete(
  "/school/timetable/delete/:timetableID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteTimetable
);
router.post(
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

//exports all route to main index
module.exports = router;