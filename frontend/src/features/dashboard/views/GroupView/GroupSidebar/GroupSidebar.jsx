import GroupItem from '../GroupItem/GroupItem';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import './GroupSidebar.css';

const GroupSidebar = ({  
    userGroups = [], 
    selectedGroup, 
    onSelectGroup,  
    onOpenActionModal,
    user
}) => {

    return (
        <div className="chat-sidebar">
            <div className="chat-sidebar-header">
                <h3 className="header-title">Chats</h3>
                <Tooltip title="Create or Join a Group" placement="top">
                    <IconButton onClick={onOpenActionModal} className="add-group-btn">
                        <AddIcon fontSize="medium" />
                    </IconButton>
                </Tooltip>
            </div>

            <div className="group-list">
                {userGroups.length === 0 ? (
                    <p className="empty-list">No groups yet. Click + to join or create one!</p>
                ) : (
                    userGroups.map(g => {
                        // Calculating Unread Count
                        const lastReadStr = g.lastRead?.[user];
                        const lastReadDate = lastReadStr ? new Date(lastReadStr) : new Date(0);
                        const unreadMsgs = (g.messages || []).filter(m => new Date(m.timestamp) > lastReadDate && m.sender !== user && m.type !== 'system');
                        
                        // Check for @mentions
                        const hasMention = unreadMsgs.some(m => m.type === 'text' && m.content.includes(`@${user}`));

                        // Get Last Message
                        const lastMsg = g.messages?.length > 0 ? g.messages[g.messages.length - 1] : null;

                        return (
                            <GroupItem 
                                key={g.id || g._id}
                                group={g}
                                isActive={selectedGroup?.id === (g.id || g._id)}
                                onClick={() => onSelectGroup(g)}
                                unreadCount={unreadMsgs.length}
                                hasMention={hasMention}
                                avatarUrl={g.avatarUrl}
                                lastMessage={lastMsg}
                                currentUser={user}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GroupSidebar;