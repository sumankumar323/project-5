const express = require('express')
const router = express.Router()
const userController = require("../controller/userController")
const productController = require("../controller/productController")
const middleware = require('../middleware/auth')

// USER APIs
router.post("/register", userController.registerUser)
router.post("/login", userController.login)
router.get("/user/:userId/profile", middleware.Authentication, userController.getUserDetails)
router.put("/user/:userId/profile", middleware.Authentication, userController.userUpdation)


//PRODUCT API
router.get("/products/:productId",productController.getProductById)
router.get("/products",productController.getProductsByFilters)
router.put("/products/:productId",productController.productUpdation)
router.delete("/products/:productId",productController.deleteByProductId )












//if api is invalid OR wrong URL
router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})


module.exports = router