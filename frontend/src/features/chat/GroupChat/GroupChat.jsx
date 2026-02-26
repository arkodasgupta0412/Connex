import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

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

const GroupChat = ({ user, group, onBack, theme }) => {
    const [messages, setMessages] = useState([]); 
    const [inputText, setInputText] = useState("");
    const [captionText, setCaptionText] = useState("");
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const messagesEndRef = useRef(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        socket.emit("join_group", group.id);


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
        socket.on("update_comments", handleUpdateComments);
        socket.on("update_likes", handleUpdateLikes);

        return () => {
            socket.off("receive_message", handleReceiveMsg);
            socket.off("update_comments", handleUpdateComments);
            socket.off("update_likes", handleUpdateLikes);
        };
    }, [group.id, user]);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const msgData = { 
            id: uuidv4(),
            groupId: group.id, 
            sender: user, 
            type: 'text', 
            content: inputText,
            timestamp: new Date().toISOString(),
            comments: [],
            likes: 0,
            likedBy: []
        };

        setMessages((prev) => [...prev, msgData]);
        setInputText("");
        socket.emit("send_message", msgData);
    };


    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await uploadService.uploadImage(file);
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
            id: uuidv4(),
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
        
        setMessages((prev) => [...prev, msgData]);
        socket.emit("send_message", msgData);
        
        setShowCaptionModal(false);
        setUploadedImageUrl(null);
        setCaptionText("");
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
            
            {/* 1. MODULAR HEADER */}
            <ChatHeader 
                groupName={group.name} 
                onBack={onBack} 
            />

            <div className="chat-area">
                {messages.length === 0 && <div className="empty-chat-message">No messages yet.</div>}
                
                {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id} 
                        msg={msg} 
                        user={user} 
                        onComment={sendComment} 
                        theme={theme}
                        socket={socket}
                        groupId={group.id}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* 2. MODULAR INPUT */}
            <ChatInput 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
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