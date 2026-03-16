import { useState, useEffect } from 'react';
import DmItem from '../DmItem/DmItem';
import userService from '../../../../../services/userService';
import './DmSidebar.css';

const DmSidebar = ({ dms, currentUser, selectedDm, onSelectDm, onStartChat }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const results = await userService.searchUsers(searchQuery);
                setSearchResults(results.filter(u => u.username !== currentUser));
            } catch (err) {
                console.error("Search error", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => fetchUsers(), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, currentUser]);

    const handleStartClick = (username) => {
        onStartChat(username);
        setSearchQuery("");
        setSearchResults([]);
    };

    return (
        <div className="chat-sidebar">
            <div className="chat-sidebar-header">
                <h3 className="header-title">Chats</h3>
            </div>

            <div className="dm-search-section">
                <div className="dm-search-label">Start a DM ?</div>
                <div className="dm-search-container">
                    
                    
                    <input 
                        type="text"
                        placeholder="search username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="dm-search-input"
                        spellCheck="false"
                    />
                    
                    {searchQuery.trim().length > 0 && (
                        <div className="dm-search-dropdown">
                            {isSearching ? (
                                <div className="dm-search-msg">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map(user => (
                                    <div key={user.username} className="dm-search-result-item">
                                        <div className="dm-search-result-info">
                                            <span className="dm-search-result-name">{user.profileName}</span>
                                            <span className="dm-search-result-username">@{user.username}</span>
                                        </div>
                                        <button 
                                            className="start-chat-btn"
                                            onClick={() => handleStartClick(user.username)}
                                        >
                                            Start chat
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="dm-search-msg">No users found</div>
                            )}
                        </div>
                    )}
                </div>
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