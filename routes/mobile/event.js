//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const {
    isSignedIn,
    checkToken,
    isTokenAuthenticated,
} = require("../../controller/auth");

//require controller module
const { getSchoolAdminByID } = require("../../controller/schoolAdmin");
const {
    getEvent,
    getAllEvent,
    createEvent,
    updateEvent,
    deleteEvent,
} = require("../../controller/mobile/event");
const { getSchoolDetailByDetailsID } = require("../../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByDetailsID);

//routes
router.get(
    "/school/event/get_event_by_id/:id",
    isSignedIn,
    isTokenAuthenticated,
    getEvent
);

router.get(
    "/school/event/all/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getAllEvent
);

router.post(
    "/school/event/create/:id",
    isSignedIn,
    isTokenAuthenticated,
    createEvent
);

router.post(
    "/school/event/update/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateEvent
);

router.delete(
    "/school/event/delete/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteEvent
);

//exports all route to main index
module.exports = router;
