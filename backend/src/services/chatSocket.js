import Message from '../models/Message.js';
import Group from '../models/Group.js';
import User from '../models/User.js';
import DM from '../models/Dm.js'; 
import DMMessage from '../models/DmMessage.js';
import aiService from './aiService.js';

export default (io) => {
    io.on("connection", (socket) => {

        // --- THE AI SUPERVISOR HELPER ---
        const superviseMessage = async (data, roomType, broadcastEvent) => {
            if (data.confirmedPII) return true;

            const evaluation = await aiService.analyzeMessage(data.content);

            // 1. Trolling: Block and send soothing reply ONLY to sender 
            if (evaluation.isTroll) {
                const systemPayload = {
                    id: `sys-${Date.now()}`,
                    sender: 'SYSTEM',
                    type: 'system',
                    content: evaluation.soothingMessage,
                    timestamp: new Date().toISOString()
                };

                // CRITICAL FIX: Attach the room ID so the frontend doesn't discard it!
                if (roomType === 'group') systemPayload.groupId = data.groupId;
                else systemPayload.dmId = data.dmId;

                // Emitting directly to 'socket' sends it ONLY to the malicious sender, nobody else sees it.
                socket.emit(broadcastEvent, systemPayload);
                return false; 
            }

            // 2. PII/OTP: Trigger confirmation alert on frontend 
            if (evaluation.isPII) {
                socket.emit("pii_confirmation_required", { originalData: data, roomType });
                return false;
            }

            return true; // Clean message
        };


        // ==========================================
        // 1. GROUP CHAT SOCKETS (Your existing code)
        // ==========================================
        socket.on("join_group", (groupId) => { socket.join(groupId); });
        socket.on("setup_user", (username) => { if (username) socket.join(username); });
        socket.on("typing", ({ groupId, username, isTyping }) => { socket.to(groupId).emit("display_typing", { username, isTyping }); });
        
        socket.on("mark_read", async ({ groupId, username }) => {
            try {
                const group = await Group.findById(groupId);
                if (group) {
                    group.lastRead.set(username, new Date());
                    await group.save();
                }
            } catch(err) { console.error("Mark read error:", err); }
        });

        socket.on("send_message", async (data) => {
            const canProceed = await superviseMessage(data, 'group', 'receive_message');
            if (!canProceed) return;

            try {
                const newMessage = new Message({
                    groupId: data.groupId, sender: data.sender, type: data.type || 'text',
                    content: data.content, caption: data.caption || "", timestamp: data.timestamp
                });
                await newMessage.save();
                const userDoc = await User.findOne({ username: data.sender }).select('avatarUrl').lean();
                io.to(data.groupId).emit("receive_message", { ...data, id: newMessage._id.toString(), senderAvatar: userDoc?.avatarUrl || "" });
            } catch (err) { console.error("Socket send_message error:", err); }
        });

        socket.on("edit_message", async ({ groupId, messageId, newContent, newCaption }) => {
            try {
                if (messageId && messageId.length === 24) {
                    const updateFields = { isEdited: true };
                    if (newContent !== undefined) updateFields.content = newContent;
                    if (newCaption !== undefined) updateFields.caption = newCaption;
                    await Message.findByIdAndUpdate(messageId, updateFields);
                    io.to(groupId).emit("message_edited", { messageId, newContent, newCaption });
                }
            } catch (err) { console.error(err); }
        });

        socket.on("delete_message", async ({ groupId, messageId }) => {
            try {
                if (messageId && messageId.length === 24) {
                    await Message.findByIdAndUpdate(messageId, { isDeleted: true, content: "This message was deleted." });
                    io.to(groupId).emit("message_deleted", { messageId });
                }
            } catch (err) { console.error(err); }
        });

        socket.on("toggle_reaction", async ({ groupId, messageId, username, reactionType }) => {
            try {
                if (messageId && messageId.length === 24) {
                    const message = await Message.findById(messageId);
                    if (message) {
                        const currentReactions = message.reactions || new Map();
                        const usersWhoReacted = currentReactions.get(reactionType) || [];
                        const userIndex = usersWhoReacted.indexOf(username);
                        if (userIndex > -1) usersWhoReacted.splice(userIndex, 1);
                        else usersWhoReacted.push(username);
                        
                        currentReactions.set(reactionType, usersWhoReacted);
                        message.reactions = currentReactions;
                        await message.save();
                        io.to(groupId).emit("update_reactions", { messageId, reactions: Object.fromEntries(message.reactions) });
                    }
                }
            } catch (err) { console.error("Socket reaction error:", err); }
        });

        socket.on("add_comment", async (data) => {
            try {
                if (data.messageId && data.messageId.length === 24) { 
                    const message = await Message.findById(data.messageId);
                    if (message) {
                        const newComment = { sender: data.sender, text: data.text, timestamp: new Date().toISOString() };
                        message.comments.push(newComment);
                        await message.save();
                        io.to(data.groupId).emit("update_comments", { messageId: data.messageId, comment: newComment });
                    }
                }
            } catch (err) { console.error(err); }
        });

        // ==========================================
        // 2. DIRECT MESSAGE SOCKETS (The missing links!)
        // ==========================================
        socket.on("join_dm", (dmId) => { socket.join(dmId); });

        socket.on("mark_dm_read", async ({ dmId, username }) => {
            try {
                const dm = await DM.findById(dmId);
                if (dm) {
                    dm.lastRead.set(username, new Date());
                    await dm.save();
                }
            } catch(err) { console.error(err); }
        });

        socket.on("send_dm_message", async (data) => {
            const canProceed = await superviseMessage(data, 'dm', 'receive_dm_message');
            if (!canProceed) return;

            try {
                const dm = await DM.findById(data.dmId);
                if (!dm || (dm.blockedBy && dm.blockedBy.length > 0)) return; 

                const newMessage = new DMMessage({
                    dmId: data.dmId, sender: data.sender, type: data.type || 'text',
                    content: data.content, caption: data.caption || "", timestamp: data.timestamp
                });
                await newMessage.save();
                io.to(data.dmId).emit("receive_dm_message", { ...data, id: newMessage._id.toString() });
            } catch (err) { console.error("DM Socket Error:", err); }
        });

        socket.on("edit_dm_message", async ({ dmId, messageId, newContent, newCaption }) => {
            try {
                if (messageId && messageId.length === 24) {
                    const updateFields = { isEdited: true };
                    if (newContent !== undefined) updateFields.content = newContent;
                    if (newCaption !== undefined) updateFields.caption = newCaption;

                    await DMMessage.findByIdAndUpdate(messageId, updateFields);
                    io.to(dmId).emit("dm_message_edited", { messageId, newContent, newCaption });
                }
            } catch (err) { console.error(err); }
        });

        socket.on("delete_dm_message", async ({ dmId, messageId }) => {
            try {
                if (messageId && messageId.length === 24) {
                    await DMMessage.findByIdAndUpdate(messageId, { isDeleted: true, content: "This message was deleted." });
                    io.to(dmId).emit("dm_message_deleted", { messageId });
                }
            } catch (err) { console.error(err); }
        });

        socket.on("toggle_dm_reaction", async ({ dmId, messageId, username, reactionType }) => {
            try {
                if (messageId && messageId.length === 24) {
                    const message = await DMMessage.findById(messageId);
                    if (message) {
                        const currentReactions = message.reactions || new Map();
                        const usersWhoReacted = currentReactions.get(reactionType) || [];
                        
                        const userIndex = usersWhoReacted.indexOf(username);
                        if (userIndex > -1) usersWhoReacted.splice(userIndex, 1);
                        else usersWhoReacted.push(username);
                        
                        currentReactions.set(reactionType, usersWhoReacted);
                        message.reactions = currentReactions;
                        await message.save();
                        io.to(dmId).emit("update_dm_reactions", { messageId, reactions: Object.fromEntries(message.reactions) });
                    }
                }
            } catch (err) { console.error(err); }
        });

        socket.on("add_dm_comment", async (data) => {
            try {
                if (data.messageId && data.messageId.length === 24) { 
                    const message = await DMMessage.findById(data.messageId);
                    if (message) {
                        const newComment = { sender: data.sender, text: data.text, timestamp: new Date().toISOString() };
                        message.comments.push(newComment);
                        await message.save();
                        io.to(data.dmId).emit("update_dm_comments", { messageId: data.messageId, comment: newComment });
                    }
                }
            } catch (err) { console.error(err); }
        });

        socket.on("send_confirmed_pii", (payload) => {
            const { originalData, roomType } = payload;
            const eventName = roomType === 'group' ? "send_message" : "send_dm_message";
            // Re-emit to the server with the confirmed flag
            socket.emit(eventName, { ...originalData, confirmedPII: true });
        });
        
    });
};