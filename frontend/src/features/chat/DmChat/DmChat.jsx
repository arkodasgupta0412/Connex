import { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { Chip } from '@mui/material';

import ChatHeader from '../components/ChatHeader/ChatHeader';
import ChatInput from '../components/ChatInput/ChatInput';
import ChatMessage from '../components/ChatMessage/ChatMessage'; 
import uploadService from '../../../services/uploadService';
import { socket } from '../GroupChat/GroupChat';
import './DmChat.css'; 

const DmChat = ({ currentUser, dmRoom, otherUser, onBack, theme, onOpenSettings }) => {
    const [messages, setMessages] = useState(dmRoom?.messages || []);
    const [inputText, setInputText] = useState("");
    const [editingMessage, setEditingMessage] = useState(null);
    
    // Image Upload States
    const [captionText, setCaptionText] = useState("");
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

    // --- Security Alert State ---
    const [piiAlert, setPiiAlert] = useState(null);

    const messagesEndRef = useRef(null);
    
    const isBlocked = dmRoom?.blockedBy?.length > 0;
    const iBlockedThem = dmRoom?.blockedBy?.includes(currentUser);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    useEffect(() => {
        setMessages(dmRoom?.messages || []);
        setInputText("");
        setEditingMessage(null);
        setPiiAlert(null);
    }, [dmRoom?.id]);

    
    useEffect(() => {
        if (!dmRoom?.id || !currentUser) return;

        socket.emit("join_dm", dmRoom.id);
        socket.emit("mark_dm_read", { dmId: dmRoom.id, username: currentUser });

        const handleReceiveMsg = (data) => {
            if(data.dmId !== dmRoom.id) return;
            setMessages((prev) => [...prev, data]);
            socket.emit("mark_dm_read", { dmId: dmRoom.id, username: currentUser });
        };

        const handlePiiConfirmation = ({ originalData, roomType }) => {
            // Triggers the custom modal instead of window.confirm
            setPiiAlert({ originalData, roomType });
        };

        socket.on("receive_dm_message", handleReceiveMsg);
        socket.on("pii_confirmation_required", handlePiiConfirmation);
        
        socket.on("dm_message_edited", ({ messageId, newContent, newCaption }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, 
                content: newContent !== undefined ? newContent : m.content,
                caption: newCaption !== undefined ? newCaption : m.caption,
                isEdited: true 
            } : m));
        });

        socket.on("dm_message_deleted", ({ messageId }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, isDeleted: true, 
                content: "This message was deleted." 
            } : m));
        });

        socket.on("update_dm_reactions", ({ messageId, reactions }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, reactions 
            } : m));
        });

        socket.on("update_dm_comments", ({ messageId, comment }) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
                ...m, comments: [...(m.comments || []), comment] 
            } : m));
        });
        
        return () => { 
            socket.off("receive_dm_message", handleReceiveMsg); 
            socket.off("pii_confirmation_required", handlePiiConfirmation);
            socket.off("dm_message_edited");
            socket.off("dm_message_deleted");
            socket.off("update_dm_reactions");
            socket.off("update_dm_comments");
        };
    }, [dmRoom?.id, currentUser]);


    // Helper for date dividers
    const isNewDay = (prevDate, currDate) => {
        if (!prevDate) return true;
        return new Date(prevDate).toDateString() !== new Date(currDate).toDateString();
    };

    const sendMessage = async () => {
        if (isBlocked || !currentUser) return;

        if (editingMessage) {
            if (editingMessage.type === 'text' && !inputText.trim()) return;
            
            const editPayload = { dmId: dmRoom.id, messageId: editingMessage.id };
            if (editingMessage.type === 'photo') {
                editPayload.newCaption = inputText.trim();
            } else {
                editPayload.newContent = inputText.trim();
            }

            socket.emit("edit_dm_message", editPayload);
            setEditingMessage(null);
            setInputText("");
            return;
        }

        if (!inputText.trim()) return;
        
        const msgData = { 
            dmId: dmRoom.id, 
            sender: currentUser, 
            type: 'text', 
            content: inputText,
            timestamp: new Date().toISOString(),
        };

        socket.emit("send_dm_message", msgData);
        setInputText("");
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
        if (!uploadedImageUrl || !currentUser) return;

        const msgData = { 
            dmId: dmRoom.id, 
            sender: currentUser, 
            type: 'photo', 
            content: uploadedImageUrl,
            caption: captionText || '',
            timestamp: new Date().toISOString(), 
            comments: [],
            reactions: {}
        };
        
        socket.emit("send_dm_message", msgData);
        
        setShowCaptionModal(false);
        setUploadedImageUrl(null);
        setCaptionText("");
    };

    const sendComment = (messageId, text) => {
        if (!currentUser) return;
        socket.emit("add_dm_comment", { 
            dmId: dmRoom.id, 
            messageId, 
            sender: currentUser, 
            text,
            timestamp: new Date().toISOString()
        });
    };

    // --- NEW: Security Alert Modal Handlers ---
    const handleConfirmPii = () => {
        if (!piiAlert) return;
        const eventName = piiAlert.roomType === 'group' ? "send_message" : "send_dm_message";
        
        // Frontend re-emits the message with the bypass flag attached
        socket.emit(eventName, { 
            ...piiAlert.originalData, 
            confirmedPII: true 
        });
        
        setPiiAlert(null); // Close modal
    };

    const handleCancelPii = () => {
        setPiiAlert(null); // Just close the modal, message is dropped
    };


    const themeClass = theme === 'dark' ? 'dark' : 'light';
    const dummyGroup = { nicknames: {} }; 

    return (
        <div className={`dm-chat-container ${themeClass}`}>
            <div className="dm-header-container">
                <ChatHeader groupName={otherUser} onBack={onBack} />
                <IconButton onClick={onOpenSettings} className="dm-settings-btn">
                    <SettingsIcon />
                </IconButton>
            </div>

            <div className="chat-area">
                {messages.length === 0 && <div className="empty-chat-message">Say hi to {otherUser}!</div>}
                
                {messages.map((msg, index) => {
                    const showDate = isNewDay(index === 0 ? null : messages[index - 1].timestamp, msg.timestamp);
                    return (
                        <div key={msg.id || index}>
                            {showDate && (
                                <div className="dm-date-divider">
                                    <Chip 
                                        label={new Date(msg.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} 
                                        size="small" 
                                        className="date-chip"
                                    />
                                </div>
                            )}
                            <ChatMessage 
                                msg={msg} 
                                user={currentUser} 
                                group={dummyGroup} 
                                theme={theme} 
                                socket={socket} 
                                groupId={dmRoom.id}
                                isDm={true}
                                onComment={sendComment}
                                onEditStart={(targetMsg) => { 
                                    setEditingMessage(targetMsg); 
                                    setInputText(targetMsg.type === 'photo' ? (targetMsg.caption || "") : targetMsg.content);
                                }}
                            />
                        </div>
                    );
                })}
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
                    <IconButton size="small" onClick={() => { setEditingMessage(null); setInputText(""); }} className="edit-banner-close">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>
            )}

            {isBlocked ? (
                <div className="blocked-banner">
                    {iBlockedThem ? "You blocked this user." : "You have been blocked."}
                </div>
            ) : (
                <ChatInput 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onSend={sendMessage}
                    onAttach={handleFileUpload}
                />
            )}

            {/* Photo Caption Modal */}
            {showCaptionModal && (
                <div className="caption-modal-overlay">
                    <div className="caption-modal">
                        {uploadedImageUrl && (
                            <img src={uploadedImageUrl} alt="preview" className="caption-preview-img" />
                        )}
                        <textarea
                            value={captionText}
                            onChange={(e) => setCaptionText(e.target.value)}
                            placeholder="Write a caption..."
                            className="caption-input"
                        />
                        <div className="caption-actions">
                            <button onClick={() => { setShowCaptionModal(false); setUploadedImageUrl(null); setCaptionText(""); }} className="btn-caption-cancel">
                                Cancel
                            </button>
                            <button onClick={sendPhotoWithCaption} className="btn-caption-send">
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW: Security Alert Modal for PII/OTP */}
            {piiAlert && (
                <div className="caption-modal-overlay">
                    <div className="caption-modal" style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--danger-color)', margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                            Security Alert
                        </h3>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.4', marginBottom: '20px' }}>
                            This message appears to contain private information (like an OTP or password). Are you sure you want to send it?
                        </p>
                        <div className="caption-actions" style={{ justifyContent: 'center' }}>
                            <button onClick={handleCancelPii} className="btn-caption-cancel">
                                Cancel
                            </button>
                            <button onClick={handleConfirmPii} className="btn-caption-send" style={{ backgroundColor: 'var(--danger-color)' }}>
                                Send Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DmChat;