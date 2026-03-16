import express from 'express';
import DM from '../../models/Dm.js';
import DMMessage from '../../models/DmMessage.js';
import User from '../../models/User.js';

export default function(io) {
    const router = express.Router();

    router.get('/:username', async (req, res) => {
        try {
            const dms = await DM.find({ participants: req.params.username }).lean();
            for (let dm of dms) {
                dm.id = dm._id.toString();
                
                const msgs = await DMMessage.find({ dmId: dm._id }).lean();
                dm.messages = msgs.map(m => ({ ...m, id: m._id.toString(), dmId: m.dmId.toString() }));

                const otherUsername = dm.participants.find(p => p !== req.params.username);
                const targetUser = await User.findOne({ username: otherUsername }).select('username profileName avatarUrl').lean();
                
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

    // --- HIGHLY LOGGED INITIATE ROUTE ---
    router.post('/initiate', async (req, res) => {
        try {
            console.log("\n--- [START] INITIATE DM ROUTE ---");
            console.log("1. Request body received:", req.body);
            
            const { user1, user2 } = req.body;
            
            if (!user1 || !user2) {
                console.log("ERROR: Missing user1 or user2.");
                return res.status(400).json({ success: false, message: "Missing user data from frontend." });
            }

            console.log(`2. Verifying target user '${user2}' exists in DB...`);
            const targetUser = await User.findOne({ username: user2 }).lean();
            if (!targetUser) {
                console.log(`ERROR: Target user '${user2}' not found.`);
                return res.status(404).json({ success: false, message: `User '${user2}' not found in database.` });
            }
            console.log(`3. Target user found: ${targetUser.username}`);

            console.log(`4. Checking if a DM room already exists between ${user1} and ${user2}...`);
            let dm = await DM.findOne({ participants: { $all: [user1, user2] } });
            
            if (!dm) {
                console.log("5. No existing room. Creating a new DM room...");
                dm = new DM({ participants: [user1, user2], blockedBy: [] });
                await dm.save();
                console.log("6. New room created with ID:", dm._id);
            } else {
                console.log("5. Existing room found with ID:", dm._id);
            }

            console.log("7. Fetching message history for the room...");
            const dmObj = dm.toObject ? dm.toObject() : dm;
            dmObj.id = dmObj._id.toString();
            dmObj.messages = await DMMessage.find({ dmId: dm._id }).lean();
            
            dmObj.otherUserDetails = {
                username: targetUser.username,
                profileName: targetUser.profileName,
                avatarUrl: targetUser.avatarUrl
            };

            console.log("8. Success! Sending DM data back to React.");
            console.log("--- [END] INITIATE DM ROUTE ---\n");
            
            res.json({ success: true, dm: dmObj });
            
        } catch (error) {
            // WE WILL NOW SEE EXACTLY WHY IT FAILED
            console.error("\nFATAL ERROR IN /initiate");
            console.error(error);
            console.error("--------------------------------\n");
            res.status(500).json({ success: false, message: error.message || "Server crash." });
        }
    });

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