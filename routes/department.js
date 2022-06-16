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
  getDepartmentByID,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
  getAllDepartment,
} = require("../controller/department");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("departmentID", getDepartmentByID);
router.param("schoolID", getSchoolDetailByID);
//routes
router.post(
  "/department/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createDepartment
);
router.put(
  "/department/edit/:departmentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateDepartment
);
router.delete(
  "/department/delete/:departmentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteDepartment
);
router.post(
  "/department/get/:departmentID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getDepartment
);
router.get(
  "/department/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllDepartment
);

//exports all route to main index
module.exports = router;
