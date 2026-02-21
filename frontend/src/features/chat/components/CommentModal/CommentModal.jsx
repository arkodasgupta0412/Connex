import { useState } from 'react';

import './CommentModal.css';

import SendIcon from '@mui/icons-material/Send';


const CommentModal = ({ msg, user, onClose, onAddComment, theme }) => {
    const [commentText, setCommentText] = useState("");

    const handleSendComment = () => {
        if (!commentText.trim()) return;
        onAddComment(msg.id, commentText);
        setCommentText("");
    };

    const themeClass = theme === 'dark' ? 'dark' : 'light';

    return (
        <div className="comment-modal-overlay">
            <div className={`comment-modal ${themeClass}`}>
                
                <div className="comment-header">
                    <h3 className="comment-title">
                        Comments ({(msg.comments || []).length})
                    </h3>
                    <button className="btn-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="comment-list">
                    {(msg.comments || []).length === 0 ? (
                        <div className="empty-comments">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        (msg.comments || []).map((comment, idx) => (
                            <div
                                key={idx}
                                className={`comment-item ${comment.sender === user ? 'mine' : ''}`}
                            >
                                <div className="comment-sender">
                                    {comment.sender === user ? 'You' : comment.sender}
                                </div>
                                <div className="comment-text">
                                    {comment.text}
                                </div>
                                <div className="comment-time">
                                    {comment.timestamp ? new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="comment-footer">
                    <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="comment-input"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                    />
                    <button
                        onClick={handleSendComment}
                        className="btn-send-comment"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;