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
  createTransportation,
  updateTransportation,
  deleteTransportation,
  getTransportation,
  getAllTransportation,
  getTransportationByID,
  AddStop
} = require("../controller/transportation");

const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("transportationID", getTransportationByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/transportation/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createTransportation
);
router.put(
  "/school/transportation/edit/:transportationID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateTransportation
);
router.post(
  "/school/transportation/route/stop/:transportationID/:id",
  isSignedIn,
  isTokenAuthenticated,
  AddStop
);
router.delete(
  "/school/transportation/delete/:transportationID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteTransportation
);
router.post(
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
