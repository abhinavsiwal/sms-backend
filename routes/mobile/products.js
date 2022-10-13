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
  getProducts,
} = require("../../controller/mobile/products");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/products/get_products/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getProducts
);


//exports all route to main index
module.exports = router;
