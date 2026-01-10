import express from "express";
import memberController from "./controller/member.controller";
import uploader from "./libs/utils/uploader";
import productController from "./controller/product.controller";
import orderController from "./controller/order.controller";

const router = express.Router();

// import {memberController} from './controller/member.controller'; then we import with {}

// Member //
router.get("/member/restaurant", memberController.getRestaurant);

router.post("/member/login", memberController.login);

router.post("/member/signup", memberController.signup);

router.post(
  "/member/logout",
  memberController.verifyAuth,
  memberController.logout
);

router.get(
  "/member/detail",
  memberController.verifyAuth,
  memberController.getMemberDetail
);

router.post(
  "/member/update",
  memberController.verifyAuth, // Authorization //
  uploader("members").single("memberImage"), // upload to members folder when memberImage file received
  memberController.updateMember
);

router.get("/member/top-users", memberController.getTopUsers);

// Product //

router.get("/product/all", productController.getProducts);

router.get(
  "/product/:id",
  memberController.retrieveAuth, // for views
  productController.getProduct
);

// Orders //

router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder
);
router.get(
  "/order/all",
  memberController.verifyAuth,
  orderController.getMyOrders
);
router.post(
  "/order/update",
  memberController.verifyAuth,
  orderController.updateOrder
);

export default router;
