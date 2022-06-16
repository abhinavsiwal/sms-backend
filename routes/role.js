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
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");
const {
  createRole,
  updateRole,
  deleteRole,
  getRole,
  getAllRole,
  getRoleByID,
} = require("../controller/role");

//param initialize
router.param("roleID", getRoleByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/role/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createRole
);
router.put(
  "/school/role/edit/:roleID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateRole
);
router.delete(
  "/school/role/delete/:roleID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteRole
);
router.post(
  "/school/role/get/:roleID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getRole
);
router.get(
  "/school/role/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllRole
);

//exports all route to main index
module.exports = router;
