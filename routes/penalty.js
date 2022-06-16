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
  createPenalty,
  updatePenalty,
  deletePenalty,
  getAllPenalty,
  getPenaltyByID,
  getAllPenaltyCustome,
} = require("../controller/penalty");

//param initialize
router.param("penaltyID", getPenaltyByID);
router.param("id", checkToken);
router.param("schooladminID", getSchoolAdminByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/penalty/create/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  createPenalty
);
router.post(
  "/school/penalty/custome/get/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllPenaltyCustome
);
router.put(
  "/school/penalty/edit/:penaltyID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  updatePenalty
);
router.delete(
  "/school/penalty/delete/:penaltyID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  deletePenalty
);
router.get(
  "/school/penalty/all/:schoolID/:schooladminID",
  isSignedIn,
  isSchoolAdminAuthenticated,
  getAllPenalty
);
//exports all route to main index
module.exports = router;
