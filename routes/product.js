//import all require dependencies
const express = require("express");
const router = express.Router();

const {
  isSignedIn,
  isTokenAuthenticated,
  checkToken,
} = require("../controller/auth");

const { addProduct, getAllProducts,deleteProduct,updateProduct } = require("../controller/product");

const { getSchoolDetailByID } = require("../controller/schooldetail");

//param initialize
router.param("id", checkToken);
router.param("schoolID", getSchoolDetailByID);

router.post(
  "/school/product/create/:id",
  isSignedIn,
  isTokenAuthenticated,
  addProduct
);

router.get(
  "/school/product/all/:schoolID/:id",
  isSignedIn,
  isTokenAuthenticated,
  getAllProducts
);
router.delete(
    "/school/product/delete/:productId/:id",
    isSignedIn,
    isTokenAuthenticated,
    deleteProduct
)
router.put(
    "/school/product/edit/:id",
    isSignedIn,
    isTokenAuthenticated,
    updateProduct
  );
//exports all route to main index
module.exports = router;
