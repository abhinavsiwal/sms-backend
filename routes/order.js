//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  checkToken,
  isTokenAuthenticated,
} = require("../controller/auth");

const { createOrder } = require("../controller/order");

const { getSchoolDetailByID } = require("../controller/schooldetail");

router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/order/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createOrder
);

//exports all route to main index
module.exports = router;
