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
  createLibrariesection,
  updateLibrariesection,
  deleteLibrariesection,
  getLibrariesection,
  getAllLibrariesection,
  updateShelfLibrariesection,
  getLibrariesectionByID,
} = require("../../controller/mobile/library_section");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("librariesectionID", getLibrariesectionByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.put(
  "/school/librariesection/shelf/edit/:librariesectionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateShelfLibrariesection
);
router.get(
  "/school/librarysection/get/:librariesectionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getLibrariesection
);
router.get(
  "/school/librarysection/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllLibrariesection
);

//exports all route to main index
module.exports = router;
