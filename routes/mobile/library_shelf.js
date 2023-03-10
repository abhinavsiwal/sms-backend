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
  getLibrarieshelf,
  getAllLibrarieshelf,
  getLibrarieshelfByID,
} = require("../../controller/mobile/library_shelf");

//param initialize
router.param("librarieshelfID", getLibrarieshelfByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/librarieshelf/get/:librarieshelfID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getLibrarieshelf
);
router.get(
  "/school/libraryshelf/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllLibrarieshelf
);

//exports all route to main index
module.exports = router;
