import express from 'express';
import User from '../../models/User.js';

const router = express.Router();

// Fetch User Profile
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });    
        }

        // prevent passing of sensitive data (password, securityAnswer) to React
        const { password, securityAnswer, ...safeUserData } = user.toObject();
        return res.json({ success: true, user: safeUserData });

    } catch (error) {
        console.error("Fetch User Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// Update user Profile
router.patch('/:username/profile', async (req, res) => {
    try {
        const { bannerUrl, avatarUrl, profileName, status, bio } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            { 
                $set: {
                    ...(bannerUrl !== undefined && { bannerUrl }),
                    ...(avatarUrl !== undefined && { avatarUrl }),
                    ...(profileName !== undefined && { profileName }),                    
                    ...(status !== undefined && { status }),
                    ...(bio !== undefined && { bio })
                }
            },
            { returnDocument: 'after' }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" }); 
        }

        const { password, securityAnswer, ...safeUserData } = updatedUser.toObject();
        return res.json({ success: true, user: safeUserData });


    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;