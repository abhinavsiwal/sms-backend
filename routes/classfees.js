//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isSchoolAdminAuthenticated,
  isTokenAuthenticated,
  checkToken,
} = require("../controller/auth");

//require controller module
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");
const {
  createClassfees,
  updateClassfees,
  deleteClassfees,
  getAllClassfees,
  getClassfeesByID,
  getAllClassfeesCustome,
  getAllClassfeesObject
} = require("../controller/classfees");

//param initialize
router.param("feesID", getClassfeesByID);
router.param("id", checkToken);
router.param("schooladminID", getSchoolAdminByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/classfees/custome/get/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllClassfeesCustome
);
router.put(
  "/school/classfees/classfees/:feesID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updateClassfees
);
router.delete(
  "/school/classfees/delete/:feesID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  deleteClassfees
);
router.get(
  "/school/classfees/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllClassfees
);
//exports all route to main index
module.exports = router;
