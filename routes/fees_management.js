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
    updateFees,
    deleteFees,
    getFees,
    feesTypeList,
    updatePenalty,
    penaltyList,
    deletePenalty,
    updateSpecialDiscount,
    deleteSpecialDiscount,
    getSpecialDiscount
} = require("../controller/fees_management");
const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

//routes
router.post(
    "/school/fees_management/update_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateFees
);


router.post(
    "/school/fees_management/delete_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteFees
);

router.post(
    "/school/fees_management/get_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getFees
);

router.post(
    "/school/fees_management/fees_type_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    feesTypeList
);

router.post(
    "/school/fees_management/update_penalty/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updatePenalty
);

router.get(
    "/school/fees_management/penalty_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    penaltyList
);

router.delete(
    "/school/fees_management/delete_penalty/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deletePenalty
);

router.post(
    "/school/fees_management/update_special_discount/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateSpecialDiscount
);

router.delete(
    "/school/fees_management/delete_special_discount/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteSpecialDiscount
);

router.get(
    "/school/fees_management/get_special_discount/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getSpecialDiscount
);


//exports all route to main index
module.exports = router;
