import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Chip } from '@mui/material';

import ChatHeader from '../components/ChatHeader/ChatHeader';
import ChatInput from '../components/ChatInput/ChatInput';
import ChatMessage from '../components/ChatMessage/ChatMessage'; 
import groupService from '../../../services/groupService';
import uploadService from '../../../services/uploadService';
import { API_URL } from  '../../../config/index'; 
import './GroupChat.css'; 


const socket = io.connect(API_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
});

socket.on("connect", () => {});
socket.on("connect_error", () => {});
socket.on("disconnect", () => {});

const GroupChat = ({ user, group, onBack, theme, onOpenSettings, onChatUpdate }) => {
    const [messages, setMessages] = useState([]); 
    const [inputText, setInputText] = useState("");
    const [captionText, setCaptionText] = useState("");
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const messagesEndRef = useRef(null);

    let typingTimeout = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        socket.emit("join_group", group.id);
        socket.emit("mark_read", { groupId: group.id, username: user });

        const fetchHistory = async () => {
            try {
                const data = await groupService.fetchAllGroups(user);
                const freshGroup = [...(data.userGroups || []), ...(data.otherGroups || [])].find(g => g.id === group.id);
                if (freshGroup && freshGroup.messages) {
                    setMessages(freshGroup.messages);
                }
            } catch (err) { console.error(err); }
        };
        fetchHistory();


        const handleReceiveMsg = (data) => {
            if(data.groupId !== group.id) return;
            setMessages((prev) => {
                if (prev.some(m => m.id === data.id)) return prev; 
                return [...prev, data];
            });
            socket.emit("mark_read", { groupId: group.id, username: user });
            if (onChatUpdate) onChatUpdate();
        };


        const handleUpdateComments = ({ messageId, comment }) => {
            setMessages((prev) => prev.map(msg => {
                if (msg.id === messageId) {
                    const updatedComments = msg.comments ? [...msg.comments, comment] : [comment];
                    return { ...msg, comments: updatedComments };
                }
                return msg;
            }));
        };


        const handleUpdateLikes = ({ messageId, likes, likedBy }) => {
            setMessages((prev) => prev.map(msg => {
                if (msg.id === messageId) {
                    return { ...msg, likes, likedBy };
                }
                return msg;
            }));
        };


        socket.on("receive_message", handleReceiveMsg);
        
        socket.on("display_typing", ({ username, isTyping }) => {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                isTyping ? newSet.add(username) : newSet.delete(username);
                return newSet;
            });
        });

        socket.on("message_edited", ({ messageId, newContent, newCaption }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, 
                content: newContent !== undefined ? newContent : m.content,
                caption: newCaption !== undefined ? newCaption : m.caption,
                isEdited: true 
            } : m));
            if (onChatUpdate) onChatUpdate();
        });

        socket.on("message_deleted", ({ messageId }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, isDeleted: true, 
                content: "This message was deleted." 
            } : m));
            if (onChatUpdate) onChatUpdate();
        });

        socket.on("update_reactions", ({ messageId, reactions }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, reactions 
            } : m));
        });

        socket.on("update_comments", ({ messageId, comment }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, comments: [...(m.comments || []), comment] 
            } : m));
        });


        return () => {
            socket.off("receive_message", handleReceiveMsg);
            socket.off("display_typing");
            socket.off("message_edited");
            socket.off("message_deleted");
            socket.off("update_reactions");
            socket.off("update_comments");
        };
    }, [group.id, user]);


    const handleTyping = (e) => {
        setInputText(e.target.value);
        socket.emit("typing", { groupId: group.id, username: user, isTyping: true });
        
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socket.emit("typing", { groupId: group.id, username: user, isTyping: false });
        }, 2000);
    };


    const isNewDay = (prevDate, currDate) => {
        if (!prevDate) return true;
        return new Date(prevDate).toDateString() !== new Date(currDate).toDateString();
    };


    const sendMessage = async () => {
        if (editingMessage) {
            // Prevent sending an empty text message, but allow emptying an image caption
            if (editingMessage.type === 'text' && !inputText.trim()) return;

            const editPayload = { 
                groupId: group.id, 
                messageId: editingMessage.id 
            };

            if (editingMessage.type === 'photo') {
                editPayload.newCaption = inputText.trim();
            } else {
                editPayload.newContent = inputText.trim();
            }

            socket.emit("edit_message", editPayload);
            setEditingMessage(null);
            setInputText("");
            return;
        }

        if (!inputText.trim()) return;

        // NORMAL SEND
        const msgData = { 
            groupId: group.id, 
            sender: user, 
            type: 'text', 
            content: inputText,
            timestamp: new Date().toISOString(),
            comments: [],
            reactions: {}
        };

        socket.emit("send_message", msgData);
        setInputText("");
        if (onChatUpdate) onChatUpdate();
    };


    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await uploadService.uploadChatImage(file);
            if (data.success) {
                setUploadedImageUrl(data.photoUrl);
                setShowCaptionModal(true);
                setCaptionText("");
            }
        } catch (err) { 
            alert("Upload failed");
        }
    };


    const sendPhotoWithCaption = () => {
        if (!uploadedImageUrl) return;

        const msgData = { 
            groupId: group.id, 
            sender: user, 
            type: 'photo', 
            content: uploadedImageUrl,
            caption: captionText || '',
            timestamp: new Date().toISOString(), 
            comments: [],
            likes: 0,
            likedBy: []
        };
        
        socket.emit("send_message", msgData);
        
        setShowCaptionModal(false);
        setUploadedImageUrl(null);
        setCaptionText("");
        if (onChatUpdate) onChatUpdate();
    };


    const sendComment = (messageId, text) => {
        socket.emit("add_comment", { 
            groupId: group.id, 
            messageId, 
            sender: user, 
            text,
            timestamp: new Date().toISOString()
        });
    };

    const themeClass = theme === 'dark' ? 'dark' : 'light';

    return (
        <div className={`group-chat-container ${themeClass}`}>
            
            {/* MODULAR HEADER */}
            <div style={{ position: 'relative' }}>
                <ChatHeader 
                    groupName={group.name} 
                    onBack={onBack} 
                />
                
                {/* THE SETTINGS GEAR ICON */}
                <IconButton 
                    onClick={onOpenSettings}
                    title="Group Settings"
                    style={{ 
                        position: 'absolute', 
                        right: '16px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: 'var(--text-secondary)' 
                    }}
                >
                    <SettingsIcon />
                </IconButton>
            </div>


            <div className="chat-area">
                {messages.length === 0 && <div className="empty-chat-message">No messages yet.</div>}
                
                {messages.map((msg, index) => {
                    const showDate = isNewDay(index === 0 ? null : messages[index - 1].timestamp, msg.timestamp);
                    return (
                        <div key={msg.id}>
                            {showDate && (
                                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                                    <Chip 
                                        label={new Date(msg.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} 
                                        size="small" 
                                        sx={{ bgcolor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }} 
                                    />
                                </div>
                            )}
                            <ChatMessage 
                                msg={msg} 
                                user={user} 
                                group={group} 
                                onComment={sendComment} 
                                theme={theme} 
                                socket={socket} 
                                groupId={group.id} 
                                onEditStart={(targetMsg) => { 
                                    setEditingMessage(targetMsg); 
                                    setInputText(targetMsg.type === 'photo' ? (targetMsg.caption || "") : targetMsg.content);
                                }}
                            />
                        </div>
                    );
                })}
                
                {typingUsers.size > 0 && (
                    <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '12px', marginLeft: '16px' }}>
                        {Array.from(typingUsers).map(u => group?.nicknames?.[u] || u).join(", ")} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>


            {editingMessage && (
                <div className="edit-banner">
                    <div className="edit-banner-info">
                        <span className="edit-banner-title">
                            {editingMessage.type === 'photo' ? 'Editing Caption' : 'Editing Message'}
                        </span>
                        <span className="edit-banner-text">
                            {editingMessage.type === 'photo' ? (editingMessage.caption || "No caption") : editingMessage.content}
                        </span>
                    </div>
                    <IconButton size="small" onClick={() => { setEditingMessage(null); setInputText(""); }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>
            )}


            {/* MODULAR INPUT */}
            <ChatInput 
                value={inputText}
                onChange={handleTyping}
                onSend={sendMessage}
                onAttach={handleFileUpload}
            />


            {/* CAPTION MODAL */}
            {showCaptionModal && (
                <div className="caption-modal-overlay">
                    <div className="caption-modal">
                        
                        {uploadedImageUrl && (
                            <img 
                                src={uploadedImageUrl}
                                alt="preview"
                                className="caption-preview-img"
                            />
                        )}
                        
                        <textarea
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            placeholder="Write a caption..."
                            className="caption-input"
                        />
                        
                        <div className="caption-actions">
                            <button
                                onClick={() => {
                                    setShowCaptionModal(false);
                                    setUploadedImageUrl(null);
                                    setCaptionText("");
                                }}
                                className="btn-caption-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendPhotoWithCaption}
                                className="btn-caption-send"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupChat;