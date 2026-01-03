import express from 'express';
const routerAdmin = express.Router(); // Tells express that which controller should handle each URL request.
import restaurantController from './controller/seller.controller';
import productController from './controller/product.controller';
import  makeUploader from './libs/utils/uploader';
// import {memberController} from './controller/member.controller'; then we import with {}. If you export wihout default you wont use {}

/* Restaurant */
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
.get("/login", restaurantController.getLogin)
.post("/login", restaurantController.processLogin)
routerAdmin
.get("/signup", restaurantController.getSignup)
.post("/signup", 
  makeUploader("members").single("memberImage"), //middleware
  restaurantController.processSignup) 

routerAdmin.get("/logout", restaurantController.logout)
routerAdmin.get("/check-me", restaurantController.checkAuthSession)

/* Product */
routerAdmin.get("/product/all", 
    restaurantController.verifyRestaurant, 
    productController.getAllProducts
);
routerAdmin.post("/product/create",
    restaurantController.verifyRestaurant, 
    // uploadProductImage.single('productImage'),
    makeUploader("products").array("productImages", 5), // for form data receiving
    productController.createNewProduct
);
routerAdmin.post("/product/:id", productController.updateChosenProduct) // id - Url variable

/* Users */
routerAdmin.get("/user/all", restaurantController.verifyRestaurant, restaurantController.getUsers);
routerAdmin.post("/user/edit", restaurantController.verifyRestaurant, restaurantController.updateChosenUser);

export default routerAdmin;