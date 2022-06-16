//import all require dependencies
const express = require("express");
const router = express.Router();

//require controller module
const {
  signout,
  signin,
  schoolSignin,
  schoolSignout,
  schoolStudentSignin,
  schoolStudentSignout,
  schoolStaffSignin,
  schoolStaffSignout,
} = require("../controller/auth");

//admin routes
router.post("/signin", signin);
router.get("/signout", signout);

//school admin
router.post("/school/signin", schoolSignin);

//exports all route to main index
module.exports = router;
