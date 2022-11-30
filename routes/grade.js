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
const {
    updateGrades,
    getGrades,
    updateExam,
    updateMarks,
    getMarks,
    getExam,
    studentMarksList,
    updateQuestion,
    getQuestion
} = require("../controller/grade");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
//routes

router.put(
    "/grades/update_grades/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateGrades
);

router.get(
    "/grades/get_grades/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getGrades
);


router.put(
    "/grades/update_exam/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateExam
);

router.put(
    "/grades/update_marks/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateMarks
);

router.post(
    "/grades/get_marks/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getMarks
);

router.post(
    "/grades/exam_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getExam
);

router.post(
    "/grades/student_marks_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    studentMarksList
);


router.put(
    "/grades/update_question/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateQuestion
);


router.post(
    "/grades/get_question/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getQuestion
);

//exports all route to main index
module.exports = router;
