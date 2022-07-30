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
  getBooksByID,
  getAllocationBooks,
} = require("../../controller/mobile/library_book");
const { getSchoolDetailByID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("booksID", getBooksByID);
router.param("schoolID", getSchoolDetailByID);

//routes

router.get(
  "/school/books/get_allocation_books/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllocationBooks
);

//exports all route to main index
module.exports = router;
