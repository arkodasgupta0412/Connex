import { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { Chip } from '@mui/material';

import ChatHeader from '../components/ChatHeader/ChatHeader';
import ChatInput from '../components/ChatInput/ChatInput';
import ChatMessage from '../components/ChatMessage/ChatMessage'; 
import uploadService from '../../../services/uploadService';
import dmService from '../../../services/dmService';
import { socket } from '../GroupChat/GroupChat'; // Assuming socket instance is exported from there
import './DmChat.css'; 


const DmChat = ({ currentUser, dmRoom, otherUser, onBack, theme, onOpenSettings }) => {
    const [messages, setMessages] = useState(dmRoom.messages || []);
    const [inputText, setInputText] = useState("");
    const [editingMessage, setEditingMessage] = useState(null);
    const messagesEndRef = useRef(null);
    
    const isBlocked = dmRoom?.blockedBy?.length > 0;
    const iBlockedThem = dmRoom?.blockedBy?.includes(currentUser);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        socket.emit("join_dm", dmRoom.id);
        socket.emit("mark_dm_read", { dmId: dmRoom.id, username: currentUser });

        const handleReceiveMsg = (data) => {
            if(data.dmId !== dmRoom.id) return;
            setMessages((prev) => [...prev, data]);
            socket.emit("mark_dm_read", { dmId: dmRoom.id, username: currentUser });
        };

        socket.on("receive_dm_message", handleReceiveMsg);
        return () => { socket.off("receive_dm_message", handleReceiveMsg); };
    }, [dmRoom.id, currentUser]);

    
    const sendMessage = async () => {
        if (!inputText.trim() || isBlocked) return;
        
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

    const themeClass = theme === 'dark' ? 'dark' : 'light';
    
    // Create a dummy group object so ChatMessage doesn't break
    const dummyGroup = { nicknames: {} };

    return (
        <div className={`dm-chat-container ${themeClass}`}>
            <div style={{ position: 'relative' }}>
                <ChatHeader groupName={otherUser} onBack={onBack} />
                <IconButton 
                    onClick={onOpenSettings}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                >
                    <SettingsIcon />
                </IconButton>
            </div>

            <div className="chat-area">
                {messages.length === 0 && <div className="empty-chat-message">Say hi to {otherUser}!</div>}
                
                {messages.map((msg) => (
                    <ChatMessage 
                        key={msg.id}
                        msg={msg} 
                        user={currentUser} 
                        group={dummyGroup} 
                        theme={theme} 
                        socket={socket} 
                        groupId={dmRoom.id} // Reusing groupId prop for socket logic
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {isBlocked ? (
                <div className="blocked-banner">
                    {iBlockedThem ? "You blocked this user." : "You have been blocked."}
                </div>
            ) : (
                <ChatInput 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onSend={sendMessage}
                    onAttach={() => alert("Uploads disabled in quick setup")}
                />
            )}
        </div>
    );
};

export default DmChat;