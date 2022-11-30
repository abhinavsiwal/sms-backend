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
    createTimetable,
    updateTimetable,
    deleteTimetable,
    getTimetable,
    getAllTimetable,
    getTimetableByID,
    getAllTimetableByFilter,
    updatePeriod,
    deletePeriod,
    updateClassTimeTable,
    timeTableList,
    teacherOccupancyList,
    PeriodMasterList,
    timeTableListV2,
    updateClassTimeTableV2
} = require("../controller/timetable");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("timetableID", getTimetableByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
    "/school/timetable/create/:id",
    isSignedIn,
    isTokenAuthenticated,
    createTimetable
);
router.put(
    "/school/timetable/edit/:timetableID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateTimetable
);
router.delete(
    "/school/timetable/delete/:timetableID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteTimetable
);
router.post(
    "/school/timetable/get/:timetableID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getTimetable
);
router.get(
    "/school/timetable/all/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getAllTimetable
);
router.post(
    "/school/timetable/custom/all/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getAllTimetableByFilter
);


router.post(
    "/school/timetable/update_period/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updatePeriod
);


router.delete(
    "/school/timetable/remove_period/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deletePeriod
);

router.put(
    "/school/timetable/update_time_table/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateClassTimeTable
);


router.put(
    "/school/timetable/update_time_table_v2/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateClassTimeTableV2
);



router.post(
    "/school/timetable/time_table_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    timeTableList
);

router.post(
    "/school/timetable/teacher_occupancy_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    teacherOccupancyList
);


router.post(
    "/school/timetable/period_master_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    PeriodMasterList
);


router.post(
    "/school/timetable/time_table_list_v2/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    timeTableListV2
);


//exports all route to main index
module.exports = router;
