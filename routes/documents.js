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
    uploadDocument,
    getDocuments
} = require("../controller/documents");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
//routes

router.post(
    "/documents/upload_document/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    uploadDocument
);

router.get(
    "/documents/get_documents/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getDocuments
);

//exports all route to main index
module.exports = router;
