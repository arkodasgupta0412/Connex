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

const ChatMessage = ({ msg, user, onComment, theme, socket, groupId }) => {
    const senderName = (msg.sender || '').trim();
    const currentUser = (user || '').trim();
    const isMe = senderName.toLowerCase() === currentUser.toLowerCase();
    const [showComments, setShowComments] = useState(false);
    
    const likes = msg.likes || 0;
    const userLiked = msg.likedBy && msg.likedBy.includes(user);

    const handleLike = () => {
        if (socket && groupId) {
            socket.emit("add_like", {
                groupId,
                messageId: msg.id,
                username: user
            });
        }
    };

    if (msg.type === 'system') {
        return (
            <div className="message-row system">
                <div className="system-message">
                    {msg.content}
                </div>
            </div>
        );
    }

    const senderColorClass = isMe ? '' : `sender-color-${getSenderColorIndex(senderName)}`;

    return (
        <div className={`message-row ${isMe ? 'sent' : 'received'}`}>
            <div className="message-bubble">
                
                {/* SENDER NAME */}
                <div className={`sender-name ${senderColorClass}`}>
                    {isMe ? 'You' : msg.sender}
                </div>

                {/* CONTENT */}
                {msg.type === 'text' ? (
                    <div className="message-text">{msg.content}</div>
                ) : (
                    <div className="message-media">
                        <img 
                            src={msg.content} 
                            alt="shared" 
                            className="message-image"
                            onClick={() => setShowComments(true)}
                        />
                        
                        {msg.caption && (
                            <div className="image-caption">
                                {msg.caption}
                            </div>
                        )}
                    </div>
                )}

                {/* LIKE & COMMENT BUTTONS */}
                <div className="message-actions">
                    <button
                        className={`action-btn ${userLiked ? 'liked' : ''}`}
                        onClick={handleLike}
                    >
                        Like {likes > 0 && `(${likes})`}
                    </button>

                    {msg.type === 'photo' && (
                        <button
                            className="action-btn"
                            onClick={() => setShowComments(true)}
                        >
                            Comment {(msg.comments || []).length > 0 && `(${(msg.comments || []).length})`}
                        </button>
                    )}
                </div>
                
                {/* TIMESTAMP */}
                <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>

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