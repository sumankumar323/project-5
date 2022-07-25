const express = require('express')
const router = express.Router()
const userController = require("../controller/userController")
const middleware = require('../middleware/auth')

// USER APIs
router.post("/register", userController.registerUser)
router.post("/login", userController.login)
router.get("/user/:userId/profile", middleware.Authentication, userController.getUserDetails)
router.put("/user/:userId/profile", middleware.Authentication, userController.userUpdation)


//if api is invalid OR wrong URL
router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    })
})


module.exports = router