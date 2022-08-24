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
    updateExam
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

//exports all route to main index
module.exports = router;
