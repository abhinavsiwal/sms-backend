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
const { getSchoolDetailByID } = require("../../controller/schooldetail");
const {
  createLibrarieshelf,
  updateLibrarieshelf,
  deleteLibrarieshelf,
  getLibrarieshelfDetailsByID,
} = require("../../controller/mobile/library_shelf");

//param initialize
router.param("librarieshelfID", getLibrarieshelfDetailsByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/libraryshelf/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createLibrarieshelf
);
router.put(
  "/school/libraryshelf/edit/:librarieshelfID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateLibrarieshelf
);
router.delete(
  "/school/libraryshelf/delete/:librarieshelfID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteLibrarieshelf
);

//exports all route to main index
module.exports = router;
