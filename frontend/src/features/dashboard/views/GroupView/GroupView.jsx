import { useState, useEffect } from 'react';

import GroupSidebar from './GroupSidebar/GroupSidebar';
import GroupChat from '../../../chat/GroupChat/GroupChat';
import GroupActionModal from './GroupModal/GroupActionModal';
import groupService from '../../../../services/groupService';
import './GroupView.css';

const GroupView = ({ user, theme }) => {
    const [userGroups, setUserGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]); 
    const [selectedGroup, setSelectedGroup] = useState(null);
    
    // Updated state name to reflect the new dual-purpose modal
    const [showActionModal, setShowActionModal] = useState(false);

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

    return (
        <div className="group-view-container">
            {/* CLEANED UP SIDEBAR */}
            <GroupSidebar 
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
        </div>
    );
};

export default GroupView;