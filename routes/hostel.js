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
  getAllBuildingsFloors,
  getAllRooms,
  allocateRoom,
  vacantRoom,
  allocateRoomList,
  deleteBuilding,
  allocationHistory,
  deleteBuildingFloor,
  buildingDetailsById,
  buildingFloorDetailsById
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
  "/school/hostel/building_details_by_id/:id",
  isSignedIn,
  isTokenAuthenticated,
  buildingDetailsById
);

router.post(
  "/school/hostel/delete_building/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteBuilding
);

router.post(
  "/school/hostel/building_floor_details_by_id/:id",
  isSignedIn,
  isTokenAuthenticated,
  buildingFloorDetailsById
);

router.post(
  "/school/hostel/create_building_floor/:id",
  isSignedIn,
  isTokenAuthenticated,
  createBuildingFloor
);

router.post(
  "/school/hostel/delete_building_floor/:id",
  isSignedIn,
  isTokenAuthenticated,
  deleteBuildingFloor
);

router.get(
  "/school/hostel/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllBuildings
);

router.get(
  "/school/hostel/get_all_building_floors/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllBuildingsFloors
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
  "/school/hostel/allocate_room_list/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  allocateRoomList
);


router.post(
  "/school/hostel/vacant_room/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  vacantRoom
);


router.post(
  "/school/hostel/allocation_hostory/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  allocationHistory
);

//exports all route to main index
module.exports = router;
