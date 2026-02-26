import express from 'express';
import User from '../../models/User.js';


const router = express.Router();

// SIGNUP Endpoint
router.post('/signup', async (req, res) => {

    try {
        const { username, password, confirmPassword, securityAnswer, profileName } = req.body;

        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.json({
                success : false,
                message: "User already exists!"
            });
        }

        if (confirmPassword !== password) {
            return res.json({
                success : false,
                message : "Passwords do not match!"
            });
        }

        if (!securityAnswer || !profileName) {
            return res.json({
                success : false,
                message : "Please fill in all required fields!"
            });
        }


        const newUser = new User({
            username,
            password,
            securityAnswer,
            profileName
        });

        await newUser.save();

        res.json({
            success : true,
            message: "Register successful"
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error"
        });
    }
});


// LOGIN endpoint
router.post("/login", async (req, res) => {

    try {
        const { username, password } = req.body
        
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.json({
                success: false,
                message: "Username not found!"
            });
        }

        if (user.password !== password) {
            return res.json({
                success: false,
                message: "Incorrect Password!"
            });
        }

        res.json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error"
        });
    }
});


// FORGOT-PASSWORD endpoint
router.post("/forgot-password", async (req, res) => {
    
    try {
        const { username, newPassword, confirmNewPassword, securityAnswer } = req.body;
        
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.json({
                success: false,
                message: "Username not found!"
            });
        }

        if (confirmNewPassword !== newPassword) {
            return res.json({
                success : false,
                message : "Passwords do not match!"
            });
        }

        if (user.securityAnswer !== securityAnswer) {
            return res.json({
                success: false,
                message: "Security answer is incorrect!"
            });
        } 

        user.password = newPassword;
        await user.save();

        return res.json({
            success : true,
            message : "Password reset successful!"
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error"
        });
    }
});


// LOGOUT endpoint
router.post("/logout", (req, res) => {
    return res.json({
        success: true,
        message: "Logout successful"
    });
});

export default router;