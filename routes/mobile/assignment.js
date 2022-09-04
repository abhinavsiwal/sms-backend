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
  createAssignment,
  assignmentList,
  submitAssignment,
  subjectList,
  subjectAssignmentList,
  assignmentDetailsById
} = require("../../controller/mobile/assignment");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.put(
  "/school/assignment/create_assignment/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  createAssignment
);

router.post(
    "/school/assignment/list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    assignmentList
);


router.post(
  "/school/assignment/submit_assignment/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  submitAssignment
);

router.post(
  "/school/assignment/subject_list/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  subjectList
);

router.post(
  "/school/assignment/subject_assignment_list/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  subjectAssignmentList
);

router.post(
  "/school/assignment/assignment_details_by_id/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  assignmentDetailsById
);


//exports all route to main index
module.exports = router;
