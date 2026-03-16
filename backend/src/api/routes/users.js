import express from 'express';
import User from '../../models/User.js';

const router = express.Router();


// Search for user
router.get('/search/query', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // Regex for prefix match, case-insensitive (e.g., typing "Ale" matches "Alex" and "Alexandria")
        const regex = new RegExp(`^${q}`, 'i');
        const users = await User.find({ username: regex })
            .select('username profileName avatarUrl')
            .limit(10)
            .lean();

        res.json(users);
    } catch (err) {
        console.error("User Search Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


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


// GET user notifications
router.get('/:username/notifications', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('notifications');
        if (!user) return res.status(404).json({ error: "User not found" });
        
        // Sort newest first
        const sortedNotifs = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
        res.json(sortedNotifs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// MARK notifications as read
router.put('/:username/notifications/read', async (req, res) => {
    try {
        await User.updateOne(
            { username: req.params.username },
            { $set: { "notifications.$[].isRead": true } }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// CLEAR all notifications
router.delete('/:username/notifications', async (req, res) => {
    try {
        await User.updateOne(
            { username: req.params.username },
            { $set: { notifications: [] } }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


export default router;