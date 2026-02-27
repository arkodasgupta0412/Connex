import express from 'express';
import Group from '../../models/Group.js';
import Message from '../../models/Message.js';


export default function(io) {
    const router = express.Router();

    // Get all groups for a user
    router.get('/:username', async (req, res) => {
        try {
            const allGroups = await Group.find().lean();
            const userGroups = [];
            const otherGroups = [];

            for (let g of allGroups) {
                g.id = g._id.toString();

                // Messages fetch for group g
                const msgs = await Message.find({ groupId: g._id }).lean();
                g.messages = msgs.map(m => ({
                    ...m,
                    id: m._id.toString(),
                    groupId: m.groupId.toString()
                }));

                if (g.members.includes(req.params.username)) {
                    userGroups.push(g);
                }
                else {
                    otherGroups.push(g);
                }
            }
            res.json({ userGroups, otherGroups });

        } catch (error) {
            console.error("Fetch Groups Error:", err);
            res.status(500).json({ error: "Server error" });
        }
    });


    // Search group by NAME
    router.get('/search/public', async (req, res) => {
        try {
            const { q } = req.query;
            if (!q) return res.json([]);
            
            // Using regex for partial, case-insensitive matches
            const regex = new RegExp(q, 'i');
            const groups = await Group.find({ name: regex })
                                      .select('name description avatarUrl bannerUrl groupCode')
                                      .lean();
            res.json(groups);

        } catch (err) {
            console.error("Search Error:", err);
            res.status(500).json({ error: "Server error" });
        }
    });


    // CREATE a new group
    router.post('/create', async (req, res) => {
        try {
            const { groupName, description, creator } = req.body;

            const newGroup = new Group({
                name: groupName,
                description: description || "",
                admins: [creator],
                members: [creator]
            });
            
            await newGroup.save();
            res.json({ success : true, group: newGroup });

        } catch (error) {
            console.error("Create Group Error:", err);
            res.status(500).json({ success: false });
        }
    });


    // Join group by CODE
    router.post('/join/code', async (req, res) => {
        try {
            const { code, username } = req.body;
            
            // Finding group by the unique code
            const group = await Group.findOne({ groupCode: code });
            if (!group) {
                return res.status(404).json({ success: false, message: "Group not found" });
            }

            // Check if already a member or already requested
            if (group.members.includes(username)) {
                return res.status(400).json({ success: false, message: "You are already a member" });
            }
            if (group.joinRequests.includes(username)) {
                return res.status(400).json({ success: false, message: "Request already sent" });
            }

            // Add user to joinRequests
            await Group.findByIdAndUpdate(group._id, {
                $addToSet: { joinRequests: username }
            });
            
            res.json({ success: true, message: "Request sent to Admins!" });
            
        } catch (err) {
            console.error("Join by Code Error:", err);
            res.status(500).json({ success: false });
        }
    });


    // REQUEST to JOIN a group
    router.post('/request', async (req, res) => {
        try {
            const { groupId, username } = req.body;

            await Group.findByIdAndUpdate(groupId, {
                $addToSet: { joinRequests: username }
            })
            res.json({ success: true });

        } catch (error) {
            console.error("Request Join Error:", err);
            res.status(500).json({ success: false });
        }
    });


    // REQUEST accept by admin
    router.post('/request/accept', async (req, res) => {
        try {
            const { groupId, username } = req.body;
            const group = await Group.findById(groupId);

            if (group && group.joinRequests.includes(username)) {

                // Move from requests to members
                group.joinRequests = group.joinRequests.filter(u => u !== username);
                if (!group.members.includes(username)) {
                    group.members.push(username);
                }
                await group.save();

                // Create the system welcome message
                const joinMessage = new Message({
                    groupId: group._id,
                    sender: 'SYSTEM',
                    type: 'system',
                    content: `${username} joined the group`
                });
                await joinMessage.save();

                // Emit socket event
                const msgData = {
                    ...joinMessage.toObject(),
                    id: joinMessage._id.toString(),
                    groupId: joinMessage.groupId.toString()
                };

                if (io && typeof io.to === 'function') {
                    io.to(groupId).emit('receive_message', msgData);
                }
                res.json({ success: true, message: 'User accepted' });

            } else {
                res.json({ success: false, message: 'Request not found' });
            }

        } catch (err) {
            console.error("Accept Request Error:", err);
            res.status(500).json({ success: false });
        }
    });


    // REQUEST reject by admin
    router.post('/request/reject', async (req, res) => {
        try {
            const { groupId, username } = req.body;

            await Group.findByIdAndUpdate(groupId, {
                $pull: { joinRequests: username }
            });
            res.json({ success: true, message: 'User rejected' });

        } catch (err) {
            console.error("Reject Request Error:", err);
            res.status(500).json({ success: false });
        }
    });

    return router;
}