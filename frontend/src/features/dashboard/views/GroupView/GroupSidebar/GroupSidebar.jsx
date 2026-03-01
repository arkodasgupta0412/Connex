import GroupItem from '../GroupItem/GroupItem';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import './GroupSidebar.css';

const GroupSidebar = ({  
    user,
    userGroups = [], 
    selectedGroup, 
    onSelectGroup,  
    onOpenActionModal
}) => {

    return (
        <div className="chat-sidebar">
            {/* HEADER */}
            <div className="chat-sidebar-header">
                <h3 className="header-title">Chats</h3>
                
                {/* ADD '+' ICON */}
                <Tooltip title="Create or Join a Group" placement="top">
                    <IconButton 
                        onClick={onOpenActionModal} 
                        className="add-group-btn"
                    >
                        <AddIcon fontSize="medium" />
                    </IconButton>
                </Tooltip>
            </div>

            {/* GROUP LIST */}
            <div className="group-list">
                {userGroups.length === 0 ? (
                    <p className="empty-list">
                        No groups yet. Click + to join or create one!
                    </p>
                ) : (
                    userGroups.map(g => {

                        // Calculate unread count
                        const lastReadStr = g.lastRead?.[user];
                        const lastReadDate = lastReadStr ? new Date(lastReadStr) : new Date(0);
                        const unreadCount = (g.messages || []).filter(m => 
                            new Date(m.timestamp) > lastReadDate && 
                            m.sender !== user && 
                            m.type !== 'system'
                        ).length;

                        const lastMsg = g.messages?.length > 0 ? g.messages[g.messages.length - 1] : null;

                        return (
                            <GroupItem 
                                key={g.id || g._id}
                                group={g}
                                isActive={selectedGroup?.id === (g.id || g._id)}
                                onClick={() => onSelectGroup(g)}
                                unreadCount={unreadCount}
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