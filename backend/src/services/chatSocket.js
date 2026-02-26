import Message from '../models/Message.js';


export default (io) => {
    io.on("connection", (socket) => {

        // console.log("New socket connection: " + socket.id);

        socket.on("join_group", (groupId) => {
            socket.join(groupId);
        });


        socket.on("send_message", async (data) => {
            try {
                // Save new messages to database
                const newMessage = new Message({
                    groupId: data.groupId,
                    sender: data.sender,
                    type: data.type || 'text',
                    content: data.content,
                    caption: data.caption || "",
                    timestamp: data.timestamp
                });
                await newMessage.save();

                io.to(data.groupId).emit("receive_message", data);

            } catch (err) {
                console.error("Socket send_message error:", err);
            }
        });


        socket.on("add_comment", async (data) => {
            try {
                // Fallback check to ensure we only query valid MongoDB ObjectIds
                if (data.messageId && data.messageId.length === 24) { 
                    const message = await Message.findById(data.messageId);
                    if (message) {
                        const newComment = { 
                            sender: data.sender, 
                            text: data.text,
                            timestamp: new Date().toISOString()
                        };
                        message.comments.push(newComment);
                        await message.save();
                        
                        io.to(data.groupId).emit("update_comments", { 
                            messageId: data.messageId, 
                            comment: newComment 
                        });
                    }
                }

            } catch (err) {
                console.error("Socket add_comment error:", err);
            }
        });


        socket.on("add_like", async (data) => {
            try {
                if (data.messageId && data.messageId.length === 24) {
                    const message = await Message.findById(data.messageId);
                    if (message) {
                        const userIndex = message.likedBy.indexOf(data.username);
                        if (userIndex > -1) {
                            message.likedBy.splice(userIndex, 1);
                            message.likes = Math.max(0, message.likes - 1);
                        } else {
                            message.likedBy.push(data.username);
                            message.likes += 1;
                        }
                        await message.save();

                        io.to(data.groupId).emit("update_likes", {
                            messageId: data.messageId,
                            likes: message.likes,
                            likedBy: message.likedBy
                        });
                    }
                }

            } catch (err) {
                console.error("Socket add_like error:", err);
            }
        });
    });
};