//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const { isSignedIn, isAuthenticated, isOwner } = require("../controller/auth");

//require controller module
const {
  getSuperAdminByID,
  createSuperAdmin,
  updateSuperAdmin,
  deleteSuperAdmin,
  getSuperAdmin,
  getAllSuperAdmin,
  getSuperAdminPermission,
} = require("../controller/superadmin");

//param initialize
router.param("superadminID", getSuperAdminByID);

//routes
router.post(
  "/admin/super/create/:superadminID",
  isSignedIn,
  isAuthenticated,
  createSuperAdmin
);
router.put(
  "/admin/super/edit/:superadminID",
  isSignedIn,
  isAuthenticated,
  updateSuperAdmin
);
router.delete(
  "/admin/super/delete/:superadminID",
  isSignedIn,
  isAuthenticated,
  deleteSuperAdmin
);
router.post(
  "/admin/super/get/:superadminID",
  isSignedIn,
  isAuthenticated,
  getSuperAdmin
);
router.get(
  "/admin/super/permission/:superadminID",
  isSignedIn,
  isAuthenticated,
  getSuperAdminPermission
);
router.get(
  "/admin/super/all/:superadminID",
  isSignedIn,
  isAuthenticated,
  getAllSuperAdmin
);

//exports all route to main index
module.exports = router;
