//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
    isSignedIn,
    isTokenAuthenticated,
    checkToken,
  } = require("../controller/auth");

  const {addCategory, getAllCategories, deleteCategory,updateCategory} = require("../controller/category");

  const { getSchoolDetailByID } = require("../controller/schooldetail");

  //param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
// router.param("classID", getClassByID);

//routes

router.post(
    "/school/category/create/:id",
    isSignedIn,
    isTokenAuthenticated,
    addCategory
  );

  router.get(
    "/school/category/all/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getAllCategories
  );
  router.delete(
    "/school/category/delete/:categoryId/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteCategory
  );
  router.put(
    "/school/category/edit/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateCategory
  );
  //exports all route to main index
module.exports = router;