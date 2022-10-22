//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
    isSignedIn,
    isTokenAuthenticated,
    isSchoolAdminAuthenticated,
    checkToken,
} = require("../../controller/auth");
const { getSchoolAdminByID } = require("../../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

const {
    createLeave,
    getLeaveBySID,
    deleteLeaveById,
    getAllLeaves,
    getAllStaffLeaves,
    getAllStudentLeaves,
    getLeavesByStaff,
    update_leave_status,
    getStaffLeaves,
    getStudentLeaves,
} = require("../../controller/mobile/leave");

//param initialize
router.param("schooladminID", getSchoolAdminByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
    "/school/leave/create/:id",
    isSignedIn,
    isTokenAuthenticated,
    createLeave
);

router.get(
    "/school/leave/get/:id/:sId",
    isSignedIn,
    isTokenAuthenticated,
    getLeaveBySID
);

router.delete(
    "/school/leave/delete/:leaveId/:sId/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteLeaveById
);

router.get(
    "/school/leave/get/all/:schoolID/:schooladminID",
    isSignedIn,
    isSchoolAdminAuthenticated,
    getAllLeaves
);



router.get(
    "/school/leave/staff/all/:schoolID/:id",
    isSignedIn,
    isSchoolAdminAuthenticated,
    getAllStaffLeaves
);
router.get(
    "/school/leave/student/all/:schoolID/:id",
    isSignedIn,
    isSchoolAdminAuthenticated,
    getAllStudentLeaves
);
router.get(
    "/school/leave/staff/:id/:sId",
    isSignedIn,
    isTokenAuthenticated,
    getLeavesByStaff
);

router.put(
    "/school/leave/update_leave_status/:id",
    isSignedIn,
    isTokenAuthenticated,
    update_leave_status
);

router.post(
    "/school/leave/get_staff_leaves/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getStaffLeaves
);

router.post(
    "/school/leave/get_student_leaves/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getStudentLeaves
);


//exports all route to main index
module.exports = router;
