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
  createBuilding,
  createBuildingFloor,
  getAllBuildings,
  getAllRooms,
  allocateRoom,
  vacantRoom
} = require("../controller/hostel");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
  "/school/hostel/create_building/:id",
  isSignedIn,
  isTokenAuthenticated,
  createBuilding
);

router.post(
  "/school/hostel/create_building_floor/:id",
  isSignedIn,
  isTokenAuthenticated,
  createBuildingFloor
);

router.get(
  "/school/hostel/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllBuildings
);

router.post(
  "/school/hostel/get_all_rooms/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllRooms
);

router.post(
  "/school/hostel/allocate_room/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  allocateRoom
);

router.post(
  "/school/hostel/vacant_room/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  vacantRoom
);

//exports all route to main index
module.exports = router;
