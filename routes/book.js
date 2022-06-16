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
  createBooks,
  updateBooks,
  deleteBooks,
  getBooks,
  getAllBooks,
  getBooksByID,
  getAllBooksFromKeyword
} = require("../controller/book");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("booksID", getBooksByID);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/books/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createBooks
);
router.post(
  "/school/books/result/all/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllBooksFromKeyword
);
router.put(
  "/school/books/edit/:booksID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateBooks
);
router.delete(
  "/school/books/delete/:booksID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteBooks
);
router.get(
  "/school/books/get/:booksID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getBooks
);
router.get(
  "/school/books/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllBooks
);

//exports all route to main index
module.exports = router;
