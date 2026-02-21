import { useState, useEffect } from 'react';

import GroupSidebar from './GroupSidebar/GroupSidebar';
import GroupChat from '../../../chat/GroupChat/GroupChat';
import GroupModal from './GroupModal/GroupModal';
import { API_URL } from '../../../../config/index'; 
import './GroupView.css';

const GroupView = ({ user, theme }) => {
    const [userGroups, setUserGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]); 
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${API_URL}/groups/${user}`);
            const data = await res.json();
            setUserGroups(data.userGroups);
            setAllGroups(data.otherGroups);
        } catch (e) { console.error("Fetch error", e); }
    };

    const handleCreateGroup = async (newGroupName) => {
        await fetch(`${API_URL}/groups/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupName: newGroupName, creator: user })
        });
        fetchGroups();
    };

    const handleRequestJoin = async (groupId) => {
        await fetch(`${API_URL}/groups/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, username: user })
        });
        alert("Request sent!");
        fetchGroups();
    };

    const handleAcceptRequest = async (groupId, username) => {
        await fetch(`${API_URL}/groups/request/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, username })
        });
        fetchGroups();
    };

    const handleRejectRequest = async (groupId, username) => {
        await fetch(`${API_URL}/groups/request/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId, username })
        });
        fetchGroups();
    };

    return (
        <div className="group-view-container">
            <GroupSidebar 
                user={user}
                userGroups={userGroups}
                allGroups={allGroups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onOpenCreateModal={() => setShowCreateModal(true)}
                onRequestJoin={handleRequestJoin}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
            />

            <div className="group-chat-area">
                {selectedGroup ? (
                    <GroupChat 
                        user={user} 
                        group={selectedGroup} 
                        onBack={() => setSelectedGroup(null)} 
                        theme={theme} 
                    />
                ) : (
                    <div className="group-empty-state">
                        <h2>Welcome, {user}!</h2>
                        <p>Select a group from the left to start chatting.</p>
                    </div>
                )}
            </div>

            <GroupModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateGroup}
            />
        </div>
    );
};

export default GroupView;