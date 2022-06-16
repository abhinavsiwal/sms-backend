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
  createClass,
  updateClass,
  deleteClass,
  getClass,
  getAllClass,
  updateSectionClass,
  getClassByID,
  bulkCreateClass
} = require("../controller/class");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("classID", getClassByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/class/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createClass
);
router.post(
  "/school/class/bulk/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  bulkCreateClass
);
router.put(
  "/school/class/edit/:classID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateClass
);
router.put(
  "/school/class/section/edit/:classID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateSectionClass
);
router.delete(
  "/school/class/delete/:classID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteClass
);
router.get(
  "/school/class/get/:classID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getClass
);
router.get(
  "/school/class/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllClass
);

//exports all route to main index
module.exports = router;
