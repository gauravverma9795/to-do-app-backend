const express = require("express");
const router = express.Router();

const{
    login,
    signUp,
    sendOTP
} = require("../controllers/Auth");


// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signUp)


module.exports = router
