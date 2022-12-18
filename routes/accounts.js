//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
    isSignedIn,
    isTokenAuthenticated,
    checkToken,
} = require("../controller/auth");
const { getSchoolDetailByID } = require("../controller/schooldetail");

const {
    LinkSalaryWithStudent,
    LinkSalaryWithStudentList,
    staffSalaryGenerate,
    staffSalaryList
} = require("../controller/accounts");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
    "/school/accounts/link_salary_with_student/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    LinkSalaryWithStudent
);


router.get(
    "/school/accounts/link_salary_with_student_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    LinkSalaryWithStudentList
);


router.get(
    "/school/accounts/staff_salary_generate/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    staffSalaryGenerate
);


router.post(
    "/school/accounts/staff_salary_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    staffSalaryList
);


//exports all route to main index
module.exports = router;
