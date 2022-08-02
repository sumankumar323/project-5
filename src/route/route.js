const express = require('express')
const router = express.Router()
const userController = require("../controller/userController")
const productController = require("../controller/productController")
const cartController = require("../controller/cartController")
const orderController = require("../controller/orderController")
const Authentication = require('../middleware/auth').Authentication

// USER's APIs ->
router.post("/register", userController.registerUser)
router.post("/login", userController.login)
router.get("/user/:userId/profile", Authentication, userController.getUserDetails)
router.put("/user/:userId/profile", Authentication, userController.userUpdation)


//PRODUCT's APIs -> (No Authentication)
router.post("/products",productController.createProduct)
router.get("/products/:productId",productController.getProductById)
router.get("/products",productController.getProductsByFilters)
router.put("/products/:productId",productController.updateProduct)
router.delete("/products/:productId",productController.deleteByProductId )


// //Cart's APIs -> 
router.post('/users/:userId/cart', /*Authentication,*/ cartController.createCart)
router.put('/users/:userId/cart', /*Authentication,*/ cartController.updateCart)
router.get('/users/:userId/cart', /*Authentication,*/ cartController.getCart)
router.delete('/users/:userId/cart', /*Authentication,*/ cartController.deleteCart)

// //Order's APIs -> 
router.post('/users/:userId/orders', Authentication, orderController.createOrder)
router.put('/users/:userId/orders', Authentication, orderController.updateOrder)



//if api is invalid OR wrong URL
router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})


module.exports = router