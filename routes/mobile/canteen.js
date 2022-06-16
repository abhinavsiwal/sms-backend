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
  getCanteen,
  getAllCanteen,
} = require("../../controller/mobile/canteen");
const { getCanteenByID } = require("../../controller/canteen");

const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("canteenID", getCanteenByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.get(
  "/school/canteen/get/:canteenID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getCanteen
);
router.get(
  "/school/canteen/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllCanteen
);

//exports all route to main index
module.exports = router;
