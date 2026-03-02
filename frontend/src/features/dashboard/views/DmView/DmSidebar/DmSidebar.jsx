import { useState } from 'react';
import DmItem from '../DmItem/DmItem';
import './DmSidebar.css';

const DmSidebar = ({ dms, currentUser, selectedDm, onSelectDm, onStartChat }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onStartChat(searchQuery.trim());
        setSearchQuery("");
    };

    return (
        <div className="chat-sidebar">
            <div className="chat-sidebar-header">
                <h3 className="header-title">Chats</h3>
            </div>

            <div className="dm-search-section">
                <div className="dm-search-label">Start a DM ?</div>
                <form onSubmit={handleSearchSubmit} className="dm-search-form">
                    <input 
                        type="text" 
                        placeholder="search username..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="dm-search-input"
                    />
                </form>
            </div>

            <div className="dm-list">
                {dms.length === 0 ? (
                    <p className="empty-list">No active DMs.</p>
                ) : (
                    dms.map(dm => {
                        const lastReadStr = dm.lastRead?.[currentUser];
                        const lastReadDate = lastReadStr ? new Date(lastReadStr) : new Date(0);
                        const unreadMsgs = (dm.messages || []).filter(m => 
                            new Date(m.timestamp) > lastReadDate && 
                            m.sender !== currentUser
                        );
                        
                        const lastMsg = dm.messages?.length > 0 ? dm.messages[dm.messages.length - 1] : null;

                        return (
                            <DmItem 
                                key={dm.id}
                                otherUserDetails={dm.otherUserDetails}
                                isActive={selectedDm?.id === dm.id}
                                onClick={() => onSelectDm(dm)}
                                unreadCount={unreadMsgs.length}
                                lastMessage={lastMsg}
                                currentUser={currentUser}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default DmSidebar;