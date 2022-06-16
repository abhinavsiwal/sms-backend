//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  checkToken,
  isTokenAuthenticated,
} = require("../controller/auth");

//require controller module
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");
const {
  createSection,
  updateSection,
  deleteSection,
  getSection,
  getAllSection,
  getSectionByID,
} = require("../controller/section");

//param initialize
router.param("sectionID", getSectionByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/section/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createSection
);
router.put(
  "/school/section/edit/:sectionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateSection
);
router.delete(
  "/school/section/delete/:sectionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteSection
);
router.post(
  "/school/section/get/:sectionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getSection
);
router.get(
  "/school/section/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllSection
);

//exports all route to main index
module.exports = router;
