//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
  isSignedIn,
  isTokenAuthenticated,
  checkToken,
} = require("../controller/auth");

//require controller module
const {
  createCanteen,
  updateCanteen,
  deleteCanteen,
  getCanteen,
  getAllCanteen,
  updateSectionCanteen,
  getCanteenByID,
} = require("../controller/canteen");

const { createMenu, deleteMenu, updateMenu, getMenuByID } = require("../controller/menu");

const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("canteenID", getCanteenByID);
router.param("menuID", getMenuByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/canteen/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createCanteen
);
router.post(
  "/school/canteen/menu/add/:id",
  isSignedIn,
  isTokenAuthenticated,
  createMenu
);
router.put(
  "/school/canteen/edit/:canteenID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateCanteen
);
router.put(
  "/school/canteen/menu/edit/:menuID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateMenu
);
router.put(
  "/school/canteen/section/edit/:canteenID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateSectionCanteen
);
router.delete(
  "/school/canteen/delete/:canteenID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteCanteen
);
router.delete(
  "/school/canteen/menu/delete/:menuID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteMenu
);
router.post(
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
