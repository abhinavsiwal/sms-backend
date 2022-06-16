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
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");
const {
  createSubject,
  updateSubject,
  deleteSubject,
  getSubject,
  getAllSubject,
  getSubjectByID,
} = require("../controller/subject");

//param initialize
router.param("id", checkToken);
router.param("subjectID", getSubjectByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/subject/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createSubject
);
router.put(
  "/school/subject/edit/:subjectID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateSubject
);
router.delete(
  "/school/subject/delete/:subjectID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteSubject
);
router.post(
  "/school/subject/get/:subjectID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getSubject
);
router.get(
  "/school/subject/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllSubject
);

//exports all route to main index
module.exports = router;
