import Avatar from '../../../../../components/avatar/Avatar';
import './DmItem.css';

const DmItem = ({ otherUserDetails, isActive, onClick, unreadCount, lastMessage, currentUser }) => {
    const hasUnread = unreadCount > 0;
    
    // Format the username string as profileName@username per your mockup
    const displayName = otherUserDetails?.profileName 
        ? `${otherUserDetails.profileName}@${otherUserDetails.username}` 
        : `@${otherUserDetails?.username}`;

    return (
        <div onClick={onClick} className={`dm-item ${isActive ? 'active' : ''}`}>
            
            <div className="dm-item-left">
                <Avatar 
                    name={otherUserDetails?.profileName || otherUserDetails?.username} 
                    src={otherUserDetails?.avatarUrl} 
                    size="md" 
                />
                
                <div className="dm-item-content">
                    <span className={`dm-item-username ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}>
                        {displayName}
                    </span>
                    
                    {lastMessage && (
                        <span className={`dm-item-last-msg ${hasUnread ? 'unread' : ''}`}>
                            {lastMessage.sender === currentUser ? 'You: ' : ''}
                            {lastMessage.type === 'photo' ? '📷 Photo' : lastMessage.content}
                        </span>
                    )}
                </div>
            </div>

            {hasUnread && (
                <div className="dm-unread-badge">
                    {unreadCount}
                </div>
            )}
            
        </div>
    );
};

export default DmItem;