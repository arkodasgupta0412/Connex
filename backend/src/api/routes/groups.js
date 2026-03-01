import express from 'express';
import Group from '../../models/Group.js';
import Message from '../../models/Message.js';
import User from '../../models/User.js';


export default function(io) {
    const router = express.Router();


    const sendSystemMessage = async (groupId, content) => {
        const sysMsg = new Message({
            groupId: groupId,
            sender: 'SYSTEM',
            type: 'system',
            content: content
        });
        await sysMsg.save();
        const msgData = {
            ...sysMsg.toObject(),
            id: sysMsg._id.toString(),
            groupId: sysMsg.groupId.toString()
        };
        if (io && typeof io.to === 'function') {
            io.to(groupId.toString()).emit('receive_message', msgData);
        }
    };


    // Get all groups for a user
    router.get('/:username', async (req, res) => {
        try {
            const allGroups = await Group.find().lean();
            const userGroups = [];
            const otherGroups = [];

            for (let g of allGroups) {
                g.id = g._id.toString();

                const groupUsers = await User.find({ username: { $in: g.members } }).select('username avatarUrl').lean();
                const avatarMap = {};
                groupUsers.forEach(u => {
                    avatarMap[u.username] = u.avatarUrl;
                });

                // Messages fetch for group g
                const msgs = await Message.find({ groupId: g._id }).lean();
                g.messages = msgs.map(m => ({
                    ...m,
                    id: m._id.toString(),
                    groupId: m.groupId.toString(),
                    senderAvatar: avatarMap[m.sender] || ""
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
            const { name, groupName, description, creator } = req.body;

            const newGroup = new Group({
                name: groupName || name,
                description: description || "",
                owner: creator,
                admins: [creator],
                members: [creator],
                permissions: { membersCanEditGroupInfo: false }
            });
            
            await newGroup.save();
            res.json({ success : true, group: newGroup });

        } catch (error) {
            console.error("Create Group Error:", error);
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

                    io.to(username).emit('added_to_group');          
                    io.to(username).emit('new_notification', { 
                        type: 'success', 
                        text: `Your request to join ${group.name} was accepted!` 
                    });
                    
                    group.admins.forEach(admin => {
                        io.to(admin).emit('group_updated');
                    });
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

            const group = await Group.findByIdAndUpdate(groupId, {
                $pull: { joinRequests: username }
            });

            if (group && io && typeof io.to === 'function') {
                io.to(username).emit('new_notification', { 
                    type: 'error', 
                    text: `Your request to join ${group.name} was declined.` 
                });
                
                group.admins.forEach(admin => {
                    io.to(admin).emit('group_updated');
                });
            }

            res.json({ success: true, message: 'User rejected' });

        } catch (err) {
            console.error("Reject Request Error:", err);
            res.status(500).json({ success: false });
        }
    });


    // Group Leave endpoint
    router.post('/leave', async (req, res) => {
        try {
            const { groupId, username } = req.body;
            const group = await Group.findById(groupId);
            if (!group) return res.status(404).json({ error: "Group not found" });

            // Remove from members and admins
            group.members = group.members.filter(m => m !== username);
            group.admins = group.admins.filter(m => m !== username);
            
            // If owner leaves, reassign owner or delete group
            group.owner = group.owner.filter(m => m !== username);
            
            await group.save();

            // Tell the group chat that the user left
            const leaveMsg = new Message({
                groupId: group._id, sender: 'System', type: 'system',
                content: `${username} left the group`
            });
            await leaveMsg.save();

            if (io) {
                io.to(groupId).emit('receive_message', { ...leaveMsg.toObject(), id: leaveMsg._id.toString() });
                io.to(username).emit('group_updated');
            }

            res.json({ success: true, message: "Left group successfully" });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });


    // Update Group Info
    router.put('/:id/info', async (req, res) => {
        try {
            const { description, avatarUrl, bannerUrl, username } = req.body;
            const group = await Group.findById(req.params.id);
            
            let messagesToSend = [];

            if (description !== undefined && description !== group.description) {
                group.description = description;
                messagesToSend.push(`${username} updated the group description`);
            }
            
            if (avatarUrl !== undefined && avatarUrl !== group.avatarUrl) {
                group.avatarUrl = avatarUrl;
                messagesToSend.push(`${username} ${avatarUrl === "" ? "removed the group avatar" : "updated the group avatar"}`);
            }
            
            if (bannerUrl !== undefined && bannerUrl !== group.bannerUrl) {
                group.bannerUrl = bannerUrl;
                messagesToSend.push(`${username} ${bannerUrl === "" ? "removed the group banner" : "updated the group banner"}`);
            }

            await group.save();

            for (const msg of messagesToSend) {
                await sendSystemMessage(group._id, msg);
            }

            res.json({ success: true });

        } catch (err) {
            console.error("Settings Update Error:", err);
            res.status(500).json({ success: false });
        }
    });


    // Update group permissions
    router.put('/:id/permissions', async (req, res) => {
        try {
            const { membersCanEditInfo, adminUsername } = req.body;
            const group = await Group.findById(req.params.id);
            
            group.permissions.membersCanEditGroupInfo = membersCanEditInfo;
            await group.save();

            const status = membersCanEditInfo ? "allowed" : "restricted";
            await sendSystemMessage(group._id, `${adminUsername} ${status} members to edit group settings`);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false });
        }
    });


    // Set NEW nickname
    router.put('/:id/nickname', async (req, res) => {
        try {
            const { username, nickname } = req.body;
            const group = await Group.findById(req.params.id);
            
            group.nicknames.set(username, nickname);
            await group.save();

            await sendSystemMessage(group._id, `${username} changed their nickname to ${nickname}`);
            res.json({ success: true });

        } catch (err) {
            res.status(500).json({ success: false });
        }
    });


    // Promote / Demote member
    router.put('/:id/role', async (req, res) => {
        try {
            const { targetUser, action, adminUsername } = req.body;
            const group = await Group.findById(req.params.id);

            if (action === "promote") {
                if (!group.admins.includes(targetUser)) {
                    group.admins.push(targetUser);
                    await sendSystemMessage(group._id, `${adminUsername} promoted ${targetUser} to Admin`);
                }
            } else if (action === "demote") {
                group.admins = group.admins.filter(u => u !== targetUser);
                await sendSystemMessage(group._id, `${adminUsername} demoted ${targetUser} to Member`);
            }

            await group.save();
            res.json({ success: true });

        } catch (error) {
            res.status(500).json({ success: false });
        }
    });

    
    return router;
}