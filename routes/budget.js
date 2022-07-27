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
    updateBudget,
    allocationList,
    updateDepartmentBudget,
    departmentBudgetList,
    usedBudgetUpdate,
    usedBudgetList,
    deleteBudget,
    deleteDepartmentBudget
    // accountsStaffList,
} = require("../controller/budget");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.put(
    "/school/budget/update_budget/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateBudget
);

router.post(
    "/school/budget/allocation_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    allocationList
);

router.put(
    "/school/budget/update_department_budget/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateDepartmentBudget
);


router.post(
    "/school/budget/department_budget_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    departmentBudgetList
);


router.post(
    "/school/budget/accounts_staff_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    // accountsStaffList
);


router.put(
    "/school/budget/used_budget_update/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    usedBudgetUpdate
);


router.post(
    "/school/budget/used_budget_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    usedBudgetList
);

router.delete(
    "/school/budget/delete_budget/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteBudget
);


router.delete(
    "/school/budget/delete_department_budget/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteDepartmentBudget
);




//exports all route to main index
module.exports = router;
