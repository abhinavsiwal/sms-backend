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
const { getSchoolAdminByID } = require("../controller/schoolAdmin");
const {
  createSession,
  updateSession,
  deleteSession,
  getSession,
  getAllSession,
  getSessionByID,
} = require("../controller/session");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("sessionID", getSessionByID);
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/session/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  createSession
);
router.put(
  "/school/session/edit/:sessionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  updateSession
);
router.delete(
  "/school/session/delete/:sessionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteSession
);
router.post(
  "/school/session/get/:sessionID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getSession
);
router.get(
  "/school/session/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllSession
);

//exports all route to main index
module.exports = router;
