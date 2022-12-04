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
    studentReport,
    staffReport,
    staffAttandance,
    studentAttandance,
    busReport,
    hostelReport,
    adminDashboard
} = require("../controller/reports");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
//routes

router.post(
    "/reports/student_report/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    studentReport
);


router.post(
    "/reports/staff_report/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    staffReport
);


router.post(
    "/reports/staff_attandance/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    staffAttandance
);


router.post(
    "/reports/student_attandance/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    studentAttandance
);


router.post(
    "/reports/bus_report/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    busReport
);


router.post(
    "/reports/hostel_report/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    hostelReport
);


router.post(
    "/reports/admin_dashboard/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    adminDashboard
);


//exports all route to main index
module.exports = router;
