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
  getTransportation,
  getAllTransportation,
} = require("../../controller/mobile/transportation");
const { getTransportationByID } = require("../../controller/transportation");

const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("transportationID", getTransportationByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.get(
  "/school/transportation/get/:transportationID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getTransportation
);
router.get(
  "/school/transportation/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllTransportation
);

//exports all route to main index
module.exports = router;
