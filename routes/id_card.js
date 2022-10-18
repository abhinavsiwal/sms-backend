//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
    isSignedIn,
    isTokenAuthenticated,
    isSchoolAdminAuthenticated,
    checkToken,
} = require("../controller/auth");
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const { getSchoolDetailByID } = require("../controller/schooldetail");

const {
    updateIdCard,
} = require("../controller/id_card");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
router.param("schooladminID", getSchoolAdminByID);

//routes
router.post(
    "/school/id_card/update_id_card/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateIdCard
);



//exports all route to main index
module.exports = router;