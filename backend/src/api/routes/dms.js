import express from 'express';
import DM from '../../models/Dm.js';
import DMMessage from '../../models/DmMessage.js';
import User from '../../models/User.js'; // Added User import

export default function(io) {
    const router = express.Router();

    // Fetch all DMs for a user
    router.get('/:username', async (req, res) => {
        try {
            const dms = await DM.find({ participants: req.params.username }).lean();
            for (let dm of dms) {
                dm.id = dm._id.toString();
                
                const msgs = await DMMessage.find({ dmId: dm._id }).lean();
                dm.messages = msgs.map(m => ({ ...m, id: m._id.toString(), dmId: m.dmId.toString() }));

                // Attach other user's profile details
                const otherUsername = dm.participants.find(p => p !== req.params.username);
                const targetUser = await User.findOne({ username: otherUsername }).select('profileName avatarUrl').lean();
                
                dm.otherUserDetails = targetUser ? {
                    username: targetUser.username,
                    profileName: targetUser.profileName,
                    avatarUrl: targetUser.avatarUrl
                } : { username: otherUsername, profileName: otherUsername, avatarUrl: "" };
            }
            res.json(dms);
        } catch (error) {
            res.status(500).json({ error: "Server error" });
        }
    });

    // Initiate or get existing DM
    router.post('/initiate', async (req, res) => {
        try {
            const { user1, user2 } = req.body;
            
            // Verify target user exists
            const targetUser = await User.findOne({ username: user2 }).lean();
            if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

            let dm = await DM.findOne({ participants: { $all: [user1, user2] } });
            
            if (!dm) {
                dm = new DM({ participants: [user1, user2], blockedBy: [] });
                await dm.save();
            }

            const dmObj = dm.toObject ? dm.toObject() : dm;
            dmObj.id = dmObj._id.toString();
            dmObj.messages = await DMMessage.find({ dmId: dm._id }).lean();
            dmObj.otherUserDetails = {
                username: targetUser.username,
                profileName: targetUser.profileName,
                avatarUrl: targetUser.avatarUrl
            };

            res.json({ success: true, dm: dmObj });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    });

    // Toggle Block status (Keep this as generated previously)
    router.patch('/:id/block', async (req, res) => {
        try {
            const { username, block } = req.body;
            const update = block ? { $addToSet: { blockedBy: username } } : { $pull: { blockedBy: username } };
            const dm = await DM.findByIdAndUpdate(req.params.id, update, { new: true });
            if (io) io.to(dm._id.toString()).emit('dm_updated', dm);
            res.json({ success: true, dm });
        } catch (error) { res.status(500).json({ success: false }); }
    });

    return router;
}