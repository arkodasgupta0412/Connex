import Message from '../models/Message.js';
import Group from '../models/Group.js';
import User from '../models/User.js';


export default (io) => {
    io.on("connection", (socket) => {

        socket.on("join_group", (groupId) => {
            socket.join(groupId);
        });

        socket.on("setup_user", (username) => {
            if (username) {
                socket.join(username);
            }
        });
        

        // TYPING INDICATORS
        socket.on("typing", ({ groupId, username, isTyping }) => {
            socket.to(groupId).emit("display_typing", { username, isTyping });
        });


        // MARK AS READ (Unread Badges)
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
            try {
                const newMessage = new Message({
                    groupId: data.groupId,
                    sender: data.sender,
                    type: data.type || 'text',
                    content: data.content,
                    caption: data.caption || "",
                    timestamp: data.timestamp
                });
                await newMessage.save();

                const userDoc = await User.findOne({ username: data.sender }).select('avatarUrl').lean();

                const broadcastData = { 
                    ...data, 
                    id: newMessage._id.toString(),
                    senderAvatar: userDoc?.avatarUrl || "" 
                };
                io.to(data.groupId).emit("receive_message", broadcastData);
            } catch (err) { console.error("Socket send_message error:", err); }
        });


        // EDIT & DELETE MESSAGES
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


        // EMOJI REACTIONS
        socket.on("toggle_reaction", async ({ groupId, messageId, username, reactionType }) => {
            try {
                if (messageId && messageId.length === 24) {
                    const message = await Message.findById(messageId);
                    if (message) {
                        const currentReactions = message.reactions || new Map();
                        const usersWhoReacted = currentReactions.get(reactionType) || [];
                        
                        const userIndex = usersWhoReacted.indexOf(username);
                        if (userIndex > -1) {
                            usersWhoReacted.splice(userIndex, 1);
                        } else {
                            usersWhoReacted.push(username);
                        }
                        
                        currentReactions.set(reactionType, usersWhoReacted);
                        message.reactions = currentReactions;
                        await message.save();

                        io.to(groupId).emit("update_reactions", {
                            messageId: messageId,
                            reactions: Object.fromEntries(message.reactions)
                        });
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
    });
};