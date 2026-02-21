// ---- AUTH ROUTES ----
const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../../utils/fileOps');
const { DB_USERS } = require('../../config/paths');


// SIGNUP Endpoint
router.post('/signup', (req, res) => {
    const { username, password, confirmPassword, securityAnswer, profileName } = req.body;
    const users = readJSON(DB_USERS);
    
    if (users.find(user => user.username == username)) {
        return res.json({
            success : false,
            message: "User already exists!"
        });
    }

    if (confirmPassword != password) {
        return res.json({
            success : false,
            message : "Passwords do not match!"
        });
    }

    if (!securityAnswer) {
        return res.json({
            success : false,
            message : "Please enter a security answer!"
        });
    }

    if (!profileName) {
        return res.json({
            success : false,
            message : "Please enter a profile name!"
        });
    }

    users.push({ username, password, securityAnswer, profileName })
    writeJSON(DB_USERS, users);

    res.json({
        success : true,
        message: "Register successful"
    });
});


// LOGIN endpoint
router.post("/login", (req, res) => {
    const { username, password } = req.body
    const users = readJSON(DB_USERS);

    const user = users.find(user => user.username == username);

    if (!user) {
        return res.json({
            success: false,
            message: "Username not found!"
        });
    }

    if (user.password != password) {
        return res.json({
            success: false,
            message: "Incorrect Password!"
        });
    }

    res.json({
        success: true,
        message: "Login successful"
    })
})


// FORGOT-PASSWORD endpoint
router.post("/forgot-password", (req, res) => {
        const { username, newPassword, confirmNewPassword, securityAnswer } = req.body;
        const users = readJSON(DB_USERS);

        const user = users.find(user => user.username == username);

        if (!user) {
            return res.json({
                success: false,
                message: "Username not found!"
            });
        }

        if (user.securityAnswer != securityAnswer) {
            return res.json({
                success: false,
                message: "Security answer is incorrect!"
            });
        }


        if (confirmNewPassword != newPassword) {
            return res.json({
                success : false,
                message : "Passwords do not match!"
            });
        }

        user.password = newPassword
        writeJSON(DB_USERS, users);

        return res.json({
            success : true,
            message : "Password reset successful!"
        });

})


// LOGOUT endpoint
router.post("/logout", (req, res) => {
    return res.json({
        success: true,
        message: "Logout successful"
    });
})

module.exports = router;