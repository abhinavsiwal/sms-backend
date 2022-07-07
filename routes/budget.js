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
    updateBudget,
    allocationList
} = require("../controller/budget");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.put(
  "/school/budget/update_budget/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateBudget
);

router.post(
    "/school/budget/allocation_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    allocationList
);


//exports all route to main index
module.exports = router;
