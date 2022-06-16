//import all require dependencies
const express = require("express");
const router = express.Router();

//require middleware module
const { isSignedIn, isAuthenticated, isOwner } = require("../controller/auth");


//require controller module
const {
  getSuperAdminByID,
} = require("../controller/superadmin");
const { getPlanByID,createPlan,updatePlan,deletePlan,getPlan,getAllPlans } = require("../controller/plan");

//param initialize
router.param("superadminID", getSuperAdminByID);
router.param("planID", getPlanByID);

//routes
router.post(
  "/plan/create/:superadminID",
  isSignedIn,
  isAuthenticated,
  createPlan
);
router.put(
  "/plan/edit/:planID/:superadminID",
  isSignedIn,
  isAuthenticated,
  updatePlan
);
router.delete(
  "/plan/delete/:planID/:superadminID",
  isSignedIn,
  isAuthenticated,
  deletePlan
);
router.post(
  "/plan/get/:planID",
  getPlan
);
router.get(
  "/plan/all",
  getAllPlans
);


//exports all route to main index
module.exports = router;
