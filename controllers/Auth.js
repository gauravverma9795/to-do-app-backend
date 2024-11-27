const User = require("../models/User");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();


//signUp
exports.signUp = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

       
        console.log("User sign-up request:", { userName, email, password });

        // validation
        if (!userName || !email || !password ) {
            console.log("Validation failed - missing fields");
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (!userName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Username cannot be empty",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long.",
            });
        }

        // Check for existing user
        const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
        if (existingUser) {
            console.log("Existing user found:", existingUser);
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? "Email is already registered"
                    : "Username is already taken",
            });
        }

      

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully");

        // Create the user
        const user = await User.create({
            userName,
            email,
            password: hashedPassword,
            
        });
        console.log("User created successfully:", user);

        // return response successfully
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        });

    } catch (error) {
        console.error("Error during sign-up process:", error.message, error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered, please try again",
            error: error.message,  
        });
    }
};



//logIn
exports.login = async(req,res)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(403).json({
                success : false,
                message : "All fileds are required, please try again"
            })
        }
        
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User is not registered, please signUp",
            })
        }
        // generate JWT token, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                role : user.role,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn : "3h",
            })
            user.token = token;
            user.password = undefined;
        
            //create cookie and send respoonse
            const options = {
                expires : new Date(Date.now() + 3*60*60*1000 ),
                httpOnly : true,
            }
            res.cookie("token", token, options).status(200).json({
                success : true,
                token,
                user,
                message : "Logged in Successfully"
            })
        }
        else{
            return res.status(401).json({
                success : false,
                message : "Password is incorrect"
            })
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Login failure please try again",
        })
    }
}