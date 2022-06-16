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
  createLibrariehistory,
  updateLibrariehistory,
  deleteLibrariehistory,
  getLibrariehistory,
  getAllLibrariehistory,
  updateStatusLibrariehistory,
  getLibrariehistoryByID,
  getAllHistoryByType,
  getAllAllocatedBooksBySID,
  getAllReturnBooksBySID
} = require("../../controller/mobile/library_history");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);
router.param("librariehistoryID", getLibrariehistoryByID);

//routes
router.post(
  "/school/libraryhistory/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createLibrariehistory
);
router.put(
  "/school/librariehistory/edit/:librariehistoryID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateLibrariehistory
);
router.put(
  "/school/librariehistory/status/:librariehistoryID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateStatusLibrariehistory
);
router.delete(
  "/school/librariehistory/delete/:librariehistoryID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteLibrariehistory
);
router.get(
  "/school/librariehistory/get/:librariehistoryID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getLibrariehistory
);
router.get(
  "/school/libraryhistory/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllLibrariehistory
);

router.get(
  "/school/libraryhistory/get/type/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllHistoryByType
);

router.get(
  "/school/libraryhistory/get/allocated/:sId",
  // isSignedIn,
  // isTokenAuthenticated,
  getAllAllocatedBooksBySID
);
router.get(
  "/school/libraryhistory/get/return/:sId",
  // isSignedIn,
  // isTokenAuthenticated,
  getAllReturnBooksBySID
);


//exports all route to main index
module.exports = router;
