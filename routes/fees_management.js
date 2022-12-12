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
    getSpecialDiscount,
    updateAvailFees,
    getAvailFees,
    updateCoupon,
    couponList,
    removeCoupon,
    generateReceipt,
    updateSibling,
    updateSubSibling,
    getSiblingMaster,
    getSiblingStudent,
    updatePendingFees,
    pendingFees,
    pendingFeesByStudent,
    updateFeesTransactions
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

router.put(
    "/school/fees_management/update_avail_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateAvailFees
);


router.post(
    "/school/fees_management/get_avail_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getAvailFees
);


router.post(
    "/school/fees_management/update_coupon/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateCoupon
);


router.post(
    "/school/fees_management/coupon_list/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    couponList
);


router.post(
    "/school/fees_management/remove_coupon/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    removeCoupon
);


router.post(
    "/school/fees_management/generate_receipt/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    generateReceipt
);


router.post(
    "/school/fees_management/update_sibling/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateSibling
);

router.post(
    "/school/fees_management/update_sub_sibling/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateSubSibling
);


router.post(
    "/school/fees_management/get_sibling_master/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getSiblingMaster
);


router.post(
    "/school/fees_management/get_sibling_student/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    getSiblingStudent
);


router.post(
    "/school/fees_management/update_pending_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updatePendingFees
);


router.post(
    "/school/fees_management/pending_fees/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    pendingFees
);


router.post(
    "/school/fees_management/pending_fees_by_student/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    pendingFeesByStudent
);


router.post(
    "/school/fees_management/update_fees_transactions/:schoolID/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateFeesTransactions
);


//exports all route to main index
module.exports = router;
