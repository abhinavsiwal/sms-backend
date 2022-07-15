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
  getLibrariesectionByDetailsID,
} = require("../../controller/mobile/library_section");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("librariesectionID", getLibrariesectionByDetailsID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/librarysection/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createLibrariesection
);
router.put(
  "/school/librariesection/edit/:librariesectionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateLibrariesection
);
router.delete(
  "/school/librarysection/delete/:librariesectionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteLibrariesection
);

//exports all route to main index
module.exports = router;
