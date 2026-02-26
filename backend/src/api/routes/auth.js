import express from 'express';
import User from '../../models/User.js';


const router = express.Router();

// SIGNUP Endpoint
router.post('/signup', async (req, res) => {

    try {
        const username = (req.body.username || "").trim();
        const password = (req.body.password || "").trim();
        const confirmPassword = (req.body.confirmPassword || "").trim();
        const securityAnswer = (req.body.securityAnswer || "").trim();
        const profileName = (req.body.profileName || "").trim();

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
        const username = (req.body.username || "").trim();
        const password = (req.body.password || "").trim();
        
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.json({ success: false, message: "Username not found!" });
        }

        if (user.password !== password) {
            return res.json({ success: false, message: "Incorrect Password!" });
        }

        res.json({ success: true, message: "Login successful" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


// FORGOT-PASSWORD endpoint
router.post("/forgot-password", async (req, res) => {
    try {
        const username = (req.body.username || "").trim();
        const securityAnswer = (req.body.securityAnswer || "").trim();
        const newPassword = (req.body.newPassword || req.body.password || "").trim();
        const confirmNewPassword = (req.body.confirmNewPassword || req.body.confirmPassword || "").trim();
        
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.json({ success: false, message: "Username not found!" });
        }

        if (user.password.trim() == newPassword) {
            return res.json({ success: false, message: "New password is same as old password!" })
        }

        if (confirmNewPassword !== newPassword) {
            return res.json({ success: false, message: "Passwords do not match!" });
        }

        if (user.securityAnswer.trim() !== securityAnswer) {
            return res.json({ success: false, message: "Security answer is incorrect!" });
        }

        user.password = newPassword;
        await user.save();

        return res.json({ success: true, message: "Password reset successful!" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
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