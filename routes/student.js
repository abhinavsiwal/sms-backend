//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isTokenAuthenticated,
  checkToken,
  isSchoolAdminAuthenticated,
} = require("../controller/auth");

//require controller module
const {
  createStudent,
  updateStudent,
  deleteStudent,
  getStudent,
  getAllStudent,
  getStudentByID,
  updateStudentDocument,
  updateStudentPassword,
  getStudentFromSID,
  getAllStudentByFilter,
  checkConnection,
  updateParentPassword,
  uploadFile,
  checkRollNumber,
  bulkUpload
} = require("../controller/student");

const { getSchoolDetailByID } = require("../controller/schooldetail");
const { getSchoolAdminByID } = require("../controller/schoolAdmin");

//param initialize
router.param("id", checkToken);
router.param("studentID", getStudentByID);
router.param("schooladminID", getSchoolAdminByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/student/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createStudent
);
router.put(
  "/school/student/edit/:studentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStudent
);

router.put(
  "/school/student/password/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateStudentPassword
);

router.put(
  "/school/parent/password/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateParentPassword
);

router.put(
  "/school/student/document/:studentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStudentDocument
);

router.delete(
  "/school/student/delete/:studentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteStudent
);
router.get(
  "/school/student/get/:studentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStudent
);
router.get(
  "/school/student/search/SID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStudentFromSID
);
router.post(
  "/school/student/getdetails/:id",
  isSignedIn,
  isTokenAuthenticated,
  getStudent
);
router.post(
  "/school/student/parent/check/:id",
  isSignedIn,
  isTokenAuthenticated,
  checkConnection
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

router.post(
  "/school/upload_file",
  uploadFile
);


router.post(
  "/school/student/check_roll_number/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  checkRollNumber
);

router.post(
  "/school/student/bulk_upload/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  bulkUpload
);

//exports all route to main index
module.exports = router;
