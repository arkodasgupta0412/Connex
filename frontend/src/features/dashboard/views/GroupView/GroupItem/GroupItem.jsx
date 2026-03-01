import { Avatar } from '@mui/material';
import { PhotoCamera as CameraIcon } from '@mui/icons-material';
import './GroupItem.css';

const GroupItem = ({ group, isActive, onClick, unreadCount, avatarUrl, lastMessage, currentUser, hasMention }) => {
    
    let displayMsg = "Click to view chat";

    if (lastMessage) {
        if (lastMessage.type === 'photo') {
            if (lastMessage.sender === currentUser) {
                displayMsg = `You: Photo`;
            } else {
                const senderNick = group.nicknames?.[lastMessage.sender] || lastMessage.sender;
                displayMsg = `${senderNick}: Photo`;
            }

        } else if (lastMessage.type === 'system') {
            displayMsg = lastMessage.content;

        } else {
            if (lastMessage.sender === currentUser) {
                displayMsg = `You: ${lastMessage.content}`;
            } else {
                const senderNick = group.nicknames?.[lastMessage.sender] || lastMessage.sender;
                displayMsg = `${senderNick}: ${lastMessage.content}`;
            }
        }
    }

    const truncatedMsg = displayMsg.length > 35 ? displayMsg.substring(0, 35) + '...' : displayMsg;

    return (
        <div onClick={onClick} className={`group-item ${isActive ? 'active' : ''}`}>
            
            <div className="group-item-avatar">
                <Avatar src={avatarUrl} alt={group.name} className="group-item-mui-avatar">
                    {!avatarUrl && group.name.charAt(0).toUpperCase()}
                </Avatar>
            </div>
            
            <div className="group-item-info">
                <div className="group-item-name">{group.name}</div>
                <div className="group-item-status" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {lastMessage && lastMessage.type === 'photo' && (
                        <CameraIcon sx={{ fontSize: 14 }} />
                    )}
                    <span>{truncatedMsg}</span>
                </div>
            </div>

            {/* BADGE: Shows '@' for mentions, or number for unread */}
            {(unreadCount > 0 || hasMention) && (
                <div 
                    className="group-item-badge"
                    style={{ backgroundColor: hasMention ? '#f23f43' : '#23a559' }}
                >
                    {hasMention ? '@' : unreadCount}
                </div>
            )}
            
        </div>
    );
};

export default GroupItem;