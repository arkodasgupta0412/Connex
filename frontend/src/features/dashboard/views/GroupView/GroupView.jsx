import { useState, useEffect } from 'react';

import GroupSidebar from './GroupSidebar/GroupSidebar';
import GroupChat from '../../../chat/GroupChat/GroupChat';
import GroupActionModal from './GroupModal/GroupActionModal';
import GroupSettingsModal from './settings/GroupSettingsModal';
import groupService from '../../../../services/groupService';
import './GroupView.css';

const GroupView = ({ user, theme }) => {
    const [userGroups, setUserGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]); 
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

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

            if (selectedGroup) {
                const updatedSelected = [...data.userGroups, ...data.otherGroups].find(g => g.id === selectedGroup.id);
                if (updatedSelected) setSelectedGroup(updatedSelected);
            }

        } catch (e) { console.error("Fetch error", e); }
    };


    const handleLeaveGroup = async (groupId) => {
        alert("Leave group functionality coming up!");
        setShowSettingsModal(false);
    };


    return (
        <div className="group-view-container">
            {/* SIDEBAR */}
            <GroupSidebar 
                user={user}
                userGroups={userGroups}
                selectedGroup={selectedGroup}
                onSelectGroup={setSelectedGroup}
                onOpenActionModal={() => setShowActionModal(true)} 
            />

            <div className="group-chat-area">
                {selectedGroup ? (  
                    <GroupChat 
                        user={user} 
                        group={selectedGroup} 
                        onBack={() => setSelectedGroup(null)} 
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

            {/* UPDATED MODAL PROPS */}
            <GroupActionModal 
                isOpen={showActionModal}
                onClose={() => setShowActionModal(false)}
                currentUser={user}
                onGroupCreated={fetchGroups} 
            />

            {/* SETTINGS MODAL */}
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