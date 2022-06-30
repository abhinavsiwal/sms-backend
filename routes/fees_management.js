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
    updateFees,
    deleteFees,
    getFees
} = require("../controller/fees_management");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
    "/school/fees_management/update_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateFees
);


router.post(
    "/school/fees_management/delete_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteFees
);

router.post(
    "/school/fees_management/get_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getFees
);


//exports all route to main index
module.exports = router;
