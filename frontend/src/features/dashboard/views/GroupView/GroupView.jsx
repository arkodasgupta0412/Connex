import { useState, useEffect } from 'react';

import GroupSidebar from './GroupSidebar/GroupSidebar';
import GroupChat from '../../../chat/GroupChat/GroupChat';
import GroupModal from './GroupModal/GroupModal';
import groupService from '../../../../services/groupService';
import './GroupView.css';

const GroupView = ({ user, theme }) => {
    const [userGroups, setUserGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]); 
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchGroups();
        }
    }, [user]);


    const fetchGroups = async () => {
        try {
            const data = await groupService.fetchAllGroups(user);
            setUserGroups(data.userGroups);
            setAllGroups(data.otherGroups);
        } catch (e) { console.error("Fetch error", e); }
    };


    const handleCreateGroup = async (newGroupName) => {
        try {
            await groupService.createGroup(newGroupName, user);
            fetchGroups();
        } catch (e) { console.error(e); }
    };


    const handleRequestJoin = async (groupId) => {
        try {
            await groupService.requestJoin(groupId, user);
            alert("Request sent!");
            fetchGroups();
        } catch (e) { console.error(e); }
    };


    const handleAcceptRequest = async (groupId, username) => {
        try {
            await groupService.acceptRequest(groupId, username);
            fetchGroups();
        } catch (e) { console.error(e); }
    };


    const handleRejectRequest = async (groupId, username) => {
        try {
            await groupService.rejectRequest(groupId, username);
            fetchGroups();
        } catch (e) { console.error(e); }
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