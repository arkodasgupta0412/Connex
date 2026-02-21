import { useState } from 'react';
import GroupItem from '../GroupItem/GroupItem';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import './GroupSidebar.css';

const GroupSidebar = ({ 
    user, 
    userGroups = [], 
    allGroups = [], 
    selectedGroup, 
    onSelectGroup, 
    onLogout, 
    onOpenThemeModal, 
    onOpenCreateModal,
    onRequestJoin,
    onAcceptRequest,
    onRejectRequest
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showJoinRequests, setShowJoinRequests] = useState(false);

    // Search while typing
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        // Filter groups that match the typed query
        const found = allGroups.filter(g => g.name?.toLowerCase().includes(query.toLowerCase()));
        setSearchResults(found);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
    };

    const getPendingRequests = () => {
        return userGroups
            .filter(g => g.admins && g.admins.includes(user))
            .flatMap(g => (g.joinRequests || []).map(req => ({ groupId: g.id, groupName: g.name, username: req })));
    };

    const pendingRequests = getPendingRequests();

    return (
        <div className="chat-sidebar">
            {/* HEADER */}
            <div className="chat-sidebar-header">
                <h3 className="header-title">Chats</h3>
                <div className="header-actions">
                    <button onClick={() => setShowJoinRequests(!showJoinRequests)} className="btn-text btn-requests" title="Join Requests">
                        <span>Requests</span>
                        {pendingRequests.length > 0 && <span className="request-badge">{pendingRequests.length}</span>}
                    </button>
                    <button onClick={onOpenCreateModal} className="btn-text btn-add-group" title="Create New Group">
                        New
                    </button>
                </div>
            </div>

            {/* SEARCH AREA */}
            <div className="search-container">
                <div className="search-input-wrapper">
                    <SearchIcon sx={{ color: 'var(--text-secondary)', marginLeft: '8px' }} />
                    <input 
                        className="search-input"
                        placeholder="Search groups..." 
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    {/* Only show the 'X' button if there is text typed */}
                    {searchQuery && (
                        <IconButton size="small" onClick={clearSearch} sx={{ marginRight: '4px' }}>
                            <CloseIcon fontSize="small" sx={{ color: 'var(--text-secondary)' }} />
                        </IconButton>
                    )}
                </div>

                {/* SCROLLABLE SEARCH DROPDOWN */}
                {searchQuery && (
                    <div className="search-dropdown">
                        {searchResults.length > 0 ? (
                            searchResults.map(group => (
                                <div key={group.id} className="search-dropdown-item">
                                    <span className="search-group-name">{group.name}</span>
                                    <button onClick={() => onRequestJoin(group.id)} className="btn-submit" style={{  }}>
                                        Join
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="search-dropdown-empty">No groups found</div>
                        )}
                    </div>
                )}
            </div>

            {/* REQUESTS PANEL */}
            {showJoinRequests && (
                <div className="join-requests-panel">
                    <div className="panel-header">
                        <h4>Join Requests</h4>
                        <button onClick={() => setShowJoinRequests(false)} className="close-panel-btn">×</button>
                    </div>
                    {pendingRequests.map((req, idx) => (
                        <div key={idx} className="request-item">
                            <div className="request-info">
                                <strong>{req.username}</strong><br/>
                                <small>Wants to join "{req.groupName}"</small>
                            </div>
                            <div className="request-actions">
                                <button onClick={() => onAcceptRequest(req.groupId, req.username)} className="accept-btn">✓</button>
                                <button onClick={() => onRejectRequest(req.groupId, req.username)} className="reject-btn">✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* GROUP LIST */}
            <div className="group-list">
                {userGroups.length === 0 && <p className="empty-list"><center>No groups yet.</center></p>}
                {userGroups.map(g => (
                    <GroupItem 
                        key={g.id}
                        group={g}
                        isActive={selectedGroup?.id === g.id}
                        onClick={() => onSelectGroup(g)}
                    />
                ))}
            </div>
        </div>
    );
};

export default GroupSidebar;