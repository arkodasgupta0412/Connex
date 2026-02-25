import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from '../utils/fileOps.js';
import { DB_GROUPS } from '../config/paths.js';

export default (io) => {
    io.on("connection", (socket) => {
        console.log("New socket connection: " + socket.id);

        socket.on("join_group", (groupId) => {
            socket.join(groupId);
        });

        socket.on("send_message", (data) => {
            const groups = readJSON(DB_GROUPS);
            const group = groups.find(g => g.id === data.groupId);
            if (group) {
                if (!data.id) data.id = uuidv4();
                group.messages.push(data);
                writeJSON(DB_GROUPS, groups);
                io.to(data.groupId).emit("receive_message", data);
            }
        });

        socket.on("add_comment", (data) => {
            const groups = readJSON(DB_GROUPS);
            const group = groups.find(g => g.id === data.groupId);

            if (group) {
                const message = group.messages.find(m => m.id === data.messageId);
                if (message) {
                    if (!message.comments) message.comments = [];
                    const newComment = { 
                        sender: data.sender, 
                        text: data.text,
                        timestamp: new Date().toISOString()
                    };
                    message.comments.push(newComment);
                    
                    writeJSON(DB_GROUPS, groups);
                    
                    io.to(data.groupId).emit("update_comments", { 
                        messageId: data.messageId, 
                        comment: newComment 
                    });
                }
            }
        });

        socket.on("add_like", (data) => {
            const groups = readJSON(DB_GROUPS);
            const group = groups.find(g => g.id === data.groupId);

            if (group) {
                const message = group.messages.find(m => m.id === data.messageId);
                if (message) {
                    if (!message.likedBy) message.likedBy = [];
                    if (!message.likes) message.likes = 0;

                    const userIndex = message.likedBy.indexOf(data.username);
                    if (userIndex > -1) {
                        message.likedBy.splice(userIndex, 1);
                        message.likes = Math.max(0, message.likes - 1);
                    } else {
                        message.likedBy.push(data.username);
                        message.likes += 1;
                    }

                    writeJSON(DB_GROUPS, groups);

                    io.to(data.groupId).emit("update_likes", {
                        messageId: data.messageId,
                        likes: message.likes,
                        likedBy: message.likedBy
                    });
                }
            }
        });
    });
};