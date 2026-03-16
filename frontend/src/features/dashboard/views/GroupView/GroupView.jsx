import { useState, useEffect, useRef } from 'react';

import GroupSidebar from './GroupSidebar/GroupSidebar';
import GroupChat from '../../../chat/GroupChat/GroupChat';
import GroupActionModal from './GroupModal/GroupActionModal';
import GroupSettingsModal from './settings/GroupSettingsModal';
import groupService from '../../../../services/groupService';

import { socket } from '../../../chat/GroupChat/GroupChat';

import './GroupView.css';

const GroupView = ({ user, theme }) => {
    const [userGroups, setUserGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]); 
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Use a ref to protect the active group from stale DB fetches
    const activeGroupId = useRef(null);

    useEffect(() => {
        if (!user) return;

        fetchGroups();

        const setupPersonalRoom = () => {
            socket.emit("setup_user", user);
        };
        
        if (socket.connected) setupPersonalRoom();
        socket.on("connect", setupPersonalRoom);
        
        const handleUpdate = () => {
            fetchGroups(); 
        };
        
        socket.on("added_to_group", handleUpdate);
        socket.on("group_updated", handleUpdate);
        
        return () => {
            socket.off("connect", setupPersonalRoom);
            socket.off("added_to_group", handleUpdate);
            socket.off("group_updated", handleUpdate);
        };
    }, [user]);

    const fetchGroups = async () => {
        try {
            const data = await groupService.fetchAllGroups(user);
            
            // Protect the active group's 0 badge from being overwritten by stale background fetches
            const clearStaleBadge = (g) => 
                g.id === activeGroupId.current ? { ...g, unreadCount: 0, unread: 0, unreadMessages: 0, hasUnread: false } : g;

            setUserGroups((data.userGroups || []).map(clearStaleBadge));
            setAllGroups((data.otherGroups || []).map(clearStaleBadge));

            if (selectedGroup) {
                const updatedSelected = [...(data.userGroups || []), ...(data.otherGroups || [])].find(g => g.id === selectedGroup.id);
                if (updatedSelected) setSelectedGroup(updatedSelected);
            }

        } catch (e) { console.error("Fetch error", e); }
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setShowSettingsModal(false);
        activeGroupId.current = group.id;

        // FOOLPROOF UI UPDATE: Carpet-bomb all possible unread properties
        const forceClearUnread = (g) => g.id === group.id ? { 
            ...g, 
            unreadCount: 0, 
            unreadMessages: 0, 
            unread: 0,
            hasUnread: false,
            lastRead: { ...(g.lastRead || {}), [user]: new Date().toISOString() }
        } : g;

        setUserGroups(prevGroups => prevGroups.map(forceClearUnread));
        setAllGroups(prevGroups => prevGroups.map(forceClearUnread));
    };

    const handleLeaveGroup = async (groupId) => {
        try {
            await groupService.leaveGroup(groupId, user);
            setShowSettingsModal(false);
            setSelectedGroup(null);
            activeGroupId.current = null;
            fetchGroups();
        } catch (err) {
            console.error("Failed to leave group", err);
        }
    };

    return (
        <div className="group-view-container">

            <GroupSidebar 
                user={user}
                userGroups={userGroups}
                selectedGroup={selectedGroup}
                onSelectGroup={handleSelectGroup} 
                onOpenActionModal={() => setShowActionModal(true)} 
            />

            <div className="group-chat-area">
                {selectedGroup ? (  
                    <GroupChat 
                        user={user} 
                        group={selectedGroup} 
                        onBack={() => { setSelectedGroup(null); activeGroupId.current = null; }} 
                        theme={theme} 
                        onOpenSettings={() => setShowSettingsModal(true)}
                        onChatUpdate={fetchGroups}
                    />
                ) : (
                    <div className="group-empty-state">
                        <h2>Welcome, {user}!</h2>
                        <p>Select a group from the left to start chatting.</p>
                    </div>
                )}
            </div>

            <GroupActionModal 
                isOpen={showActionModal}
                onClose={() => setShowActionModal(false)}
                currentUser={user}
                onGroupCreated={fetchGroups} 
            />

            <GroupSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                group={selectedGroup}
                currentUser={user}
                onLeaveGroup={handleLeaveGroup}
                onGroupUpdated={fetchGroups}
            />

        </div>
    );
};

export default GroupView;