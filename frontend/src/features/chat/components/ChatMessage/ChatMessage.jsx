import { Avatar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { 
    ThumbUp, ThumbUpOutlined, Favorite, FavoriteBorder, 
    EmojiEmotions, EmojiEmotionsOutlined, MoreVert, ModeCommentOutlined,
    SentimentDissatisfied, SentimentDissatisfiedOutlined,
    Block as BlockIcon
} from '@mui/icons-material';

import { useState } from 'react';
import CommentModal from '../CommentModal/CommentModal';
import './ChatMessage.css'; 


const getSenderColorIndex = (username) => {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 6) + 1; // 1–6
};


const renderMessageText = (text) => {
    if (!text) return null;

    // Split text by @mentions
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
        if (part.match(/(@\w+)/)) {
            return <span key={i} className="mention-highlight">{part}</span>;
        }
        return part;
    });
};


const ChatMessage = ({ msg, user, group, onComment, theme, socket, groupId, onEditStart }) => {
    const senderName = (msg.sender || '').trim();
    const currentUser = (user || '').trim();
    const isMe = senderName.toLowerCase() === currentUser.toLowerCase();
    const senderNickname = group?.nicknames?.[senderName] || senderName;

    const [showComments, setShowComments] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(msg.content);


    let displayContent = msg.content;
    if (msg.type === 'system' && group?.nicknames) {
        Object.keys(group.nicknames).forEach(uname => {
            const regex = new RegExp(`\\b${uname}\\b`, 'g');
            displayContent = displayContent.replace(regex, group.nicknames[uname]);
        });
    }

    const handleReaction = (type) => {
        socket.emit("toggle_reaction", { groupId, messageId: msg.id, username: currentUser, reactionType: type });
    };

    const handleEditSubmit = () => {
        socket.emit("edit_message", { groupId, messageId: msg.id, newContent: editContent });
        setIsEditing(false);
    };

    const handleDelete = () => {
        socket.emit("delete_message", { groupId, messageId: msg.id });
        setAnchorEl(null);
    };

    const reactions = msg.reactions || {};
    const hasReacted = (type) => (reactions[type] || []).includes(currentUser);


    if (msg.type === 'system') {
        return (
            <div className="message-row system">
                <div className="system-message">
                    {displayContent}
                </div>
            </div>
        );
    }

    const senderColorClass = isMe ? '' : `sender-color-${getSenderColorIndex(senderName)}`;

    return (
        <div className={`message-row ${isMe ? 'sent' : 'received'}`}>

            {!isMe && (
                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#5865F2' }}>
                    {senderNickname.charAt(0).toUpperCase()}
                </Avatar>
            )}

            <div className={`message-bubble ${msg.isDeleted ? 'deleted-bubble' : ''}`}>
                
                {/* SENDER NAME */}
                <div className={`sender-name ${senderColorClass}`}>
                    {isMe ? 'You' : senderNickname}
                </div>

                {isMe && !msg.isDeleted && (
                    <div className="message-menu-icon">
                        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <MoreVert fontSize="inherit" />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                            {msg.type !== 'system' && (
                                <MenuItem onClick={() => { onEditStart(msg); setAnchorEl(null); }}>Edit</MenuItem>
                            )}
                            <MenuItem onClick={handleDelete} sx={{ color: '#f23f43' }}>Delete</MenuItem>
                        </Menu>
                    </div>
                )}


                {/* CONTENT */}
                {msg.isDeleted ? (
                    <div className="message-text deleted-text">
                        <BlockIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        This message was deleted
                    </div>
                ) : msg.type === 'text' ? (
                    <div className="message-text">
                        {/* Use the new parser here! */}
                        {renderMessageText(msg.content)} 
                        {msg.isEdited && <span className="edited-tag">(edited)</span>}
                    </div>
                ) : (
                    <div className="message-media">
                        <img src={msg.content} alt="shared" className="message-image" onClick={() => setShowComments(true)}/>
                        {(msg.caption || msg.isEdited) && (
                            <div className="image-caption">
                                {renderMessageText(msg.caption)} {msg.isEdited && <span className="edited-tag">(edited)</span>}
                            </div>
                        )}
                    </div>
                )}


                {/* LIKE & COMMENT BUTTONS */}
                {!msg.isDeleted && (
                    <div className="message-actions">
                        <div className="reaction-bar">
                            <Tooltip title="Like"><IconButton size="small" onClick={() => handleReaction('like')} color={hasReacted('like') ? "primary" : "default"}>{hasReacted('like') ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}</IconButton></Tooltip>
                            <Tooltip title="Love"><IconButton size="small" onClick={() => handleReaction('love')} color={hasReacted('love') ? "error" : "default"}>{hasReacted('love') ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}</IconButton></Tooltip>
                            <Tooltip title="Haha"><IconButton size="small" onClick={() => handleReaction('haha')} color={hasReacted('haha') ? "warning" : "default"}>{hasReacted('haha') ? <EmojiEmotions fontSize="small" /> : <EmojiEmotionsOutlined fontSize="small" />}</IconButton></Tooltip>
                        </div>
                        
                        {msg.type === 'photo' && (
                            <IconButton size="small" onClick={() => setShowComments(true)} sx={{ color: 'var(--text-secondary)' }}>
                                <ModeCommentOutlined fontSize="small" /> 
                            </IconButton>
                        )}
                    </div>
                )}

                
                {/* TIMESTAMP */}
                <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>

            
            {/* User's own avatar on the right */}
            {isMe && (
                <Avatar sx={{ width: 32, height: 32, ml: 1, bgcolor: '#23a559' }}>
                    {senderNickname.charAt(0).toUpperCase()}
                </Avatar>
            )}


            {/* COMMENT MODAL */}
            {msg.type === 'photo' && showComments && (
                <CommentModal
                    msg={msg}
                    user={user}
                    onClose={() => setShowComments(false)}
                    onAddComment={onComment}
                    theme={theme}
                />
            )}
        </div>
    );
};

export default ChatMessage;