import { useState, useEffect } from 'react';

import GroupSidebar from './GroupSidebar/GroupSidebar';
import GroupChat from '../../../chat/GroupChat/GroupChat';
import GroupActionModal from './GroupModal/GroupActionModal';
import GroupSettingsModal from './settings/GroupSettingsModal';
import groupService from '../../../../services/groupService';

import { socket } from '../../../chat/GroupChat/GroupChat';

import { Alert, Snackbar } from '@mui/material';

import './GroupView.css';

const GroupView = ({ user, theme }) => {
    const [userGroups, setUserGroups] = useState([]);
    const [allGroups, setAllGroups] = useState([]); 
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [notification, setNotification] = useState(null);


    useEffect(() => {
        if (!user) return;

        fetchGroups();

        const setupPersonalRoom = () => {
            console.log(`[Socket] Setting up personal room for: ${user}`);
            socket.emit("setup_user", user);
        };

        
        if (socket.connected) setupPersonalRoom();
        socket.on("connect", setupPersonalRoom);

        
        const handleUpdate = () => {
            console.log("[Socket] Sidebar refresh triggered");
            fetchGroups(); 
        };
        
        const handleNotification = (data) => {
            console.log("[Socket] RECEIVED NOTIFICATION:", data);
            setNotification(data);
            fetchGroups(); 
        };
        
        socket.on("added_to_group", handleUpdate);
        socket.on("group_updated", handleUpdate);
        socket.on("new_notification", handleNotification);
        
        return () => {
            socket.off("connect", setupPersonalRoom);
            socket.off("added_to_group", handleUpdate);
            socket.off("group_updated", handleUpdate);
            socket.off("new_notification", handleNotification);
        };
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
        try {
            await groupService.leaveGroup(groupId, user);
            setShowSettingsModal(false);
            setSelectedGroup(null);
            fetchGroups();

        } catch (err) {
            console.error("Failed to leave group", err);
        }
    };


    return (
        <div className="group-view-container">
            {/* NOTIFICATION POPUP */}
            <Snackbar 
                open={Boolean(notification)} 
                autoHideDuration={6000} 
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {notification && (
                    <Alert onClose={() => setNotification(null)} severity={notification.type} sx={{ width: '100%' }}>
                        {notification.text}
                    </Alert>
                )}
            </Snackbar>


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