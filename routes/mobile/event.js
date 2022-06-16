//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  checkToken,
  isTokenAuthenticated,
} = require("../../controller/auth");

//require controller module
const { getSchoolAdminByID } = require("../../controller/schoolAdmin");
const {
  getEvent,
  getAllEvent,
  createEvent,
} = require("../../controller/mobile/event");
const { getEventByID } = require("../../controller/event");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("eventID", getEventByID);
router.param("schooladminID", getSchoolAdminByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.get(
  "/school/event/get/:eventID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getEvent
);
router.get(
  "/school/event/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllEvent
);
router.post(
  "/school/event/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createEvent
);

//exports all route to main index
module.exports = router;
