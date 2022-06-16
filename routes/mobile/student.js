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
  updateStudent,
  getStudent,
  getAllStudent,
  updateStudentDocument,
  updateStudentPassword,
  getStudentFromSID,
  getAllStudentByFilter,
  updateParentPassword,
} = require("../../controller/mobile/student");

const { getStudentByID } = require("../../controller/student");

const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("studentID", getStudentByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.put(
  "/school/student/edit/:studentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStudent
);

router.put(
  "/school/student/password/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStudentPassword
);

router.put(
  "/school/parent/password/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateParentPassword
);

router.put(
  "/school/student/document/:studentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStudentDocument
);

router.get("/school/student/get/:studentID", isSignedIn, getStudent);
router.get(
  "/school/student/search/SID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStudentFromSID
);

router.get(
  "/school/student/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllStudent
);
router.post(
  "/school/student/custom/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllStudentByFilter
);

//exports all route to main index
module.exports = router;
