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
    getLibrariehistoryDetailsByID,
    getAllHistoryByType,
    createLibrariehistory,
    myHistory
} = require("../../controller/mobile/library_history");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
router.param("librariehistoryID", getLibrariehistoryDetailsByID);

//routes
router.post(
    "/school/libraryhistory/get/type/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getAllHistoryByType
);

router.post(
    "/school/libraryhistory/create/:id",
    isSignedIn,
    isTokenAuthenticated,
    createLibrariehistory
);


router.post(
    "/school/libraryhistory/my_history/:id",
    isSignedIn,
    isTokenAuthenticated,
    myHistory
);


//exports all route to main index
module.exports = router;
