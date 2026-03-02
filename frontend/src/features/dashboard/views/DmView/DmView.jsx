import { useState, useEffect } from 'react';
import DmSidebar from './DmSidebar/DmSidebar';
import DmChat from '../../../../features/chat/DmChat/DmChat';
import DmSettingsModal from './settings/DmSettingsModal';
import dmService from '../../../../services/dmService';
import './DmView.css';

const DmView = ({ currentUser, theme }) => {
    const [dms, setDms] = useState([]);
    const [selectedDm, setSelectedDm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const fetchDms = async () => {
            try {
                const data = await dmService.fetchUserDMs(currentUser);
                setDms(data || []);
            } catch (error) {
                console.error("Error fetching DMs:", error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchDms();
    }, [currentUser]);

    const handleSelectDm = (dm) => {
        setSelectedDm(dm);
        setIsSettingsOpen(false);
    };

    const handleStartChat = async (searchUsername) => {
        if (!searchUsername || searchUsername === currentUser) return;
        try {
            const res = await dmService.initiateDM(currentUser, searchUsername);
            if (res.success) {
                setDms(prevDms => {
                    const exists = prevDms.find(d => d.id === res.dm.id);
                    return exists ? prevDms : [res.dm, ...prevDms];
                });
                setSelectedDm(res.dm);
            }
        } catch (error) {
            alert("User not found.");
        }
    };

    const handleToggleBlock = async (blockStatus) => {
        if (!selectedDm) return;
        try {
            const updatedDmRoom = await dmService.toggleBlock(selectedDm.id, currentUser, blockStatus);
            setDms(prevDms => prevDms.map(dm => 
                dm.id === updatedDmRoom.dm.id ? { ...dm, blockedBy: updatedDmRoom.dm.blockedBy } : dm
            ));
            setSelectedDm(prev => ({ ...prev, blockedBy: updatedDmRoom.dm.blockedBy }));
            setIsSettingsOpen(false);
        } catch (error) {
            console.error("Error toggling block:", error);
        }
    };

    const otherUser = selectedDm ? selectedDm.participants.find(p => p !== currentUser) : null;
    const isBlockedByMe = selectedDm?.blockedBy?.includes(currentUser);

    return (
        <div className="dm-view-container">
            <div className="dm-sidebar-wrapper">
                {loading ? (
                    <div className="dm-loading">Loading chats...</div>
                ) : (
                    <DmSidebar 
                        dms={dms} 
                        currentUser={currentUser} 
                        selectedDm={selectedDm} 
                        onSelectDm={handleSelectDm}
                        onStartChat={handleStartChat}
                    />
                )}
            </div>

            <div className="dm-chat-wrapper">
                {selectedDm ? (
                    <DmChat 
                        currentUser={currentUser} 
                        dmRoom={selectedDm} 
                        otherUser={otherUser}
                        theme={theme}
                        onBack={() => setSelectedDm(null)} 
                        onOpenSettings={() => setIsSettingsOpen(true)}
                    />
                ) : (
                    <div className="dm-empty-state">
                        <div className="dm-empty-message">Select a chat to start messaging</div>
                    </div>
                )}
            </div>

            {selectedDm && isSettingsOpen && (
                <DmSettingsModal 
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    isBlockedByMe={isBlockedByMe}
                    onToggleBlock={handleToggleBlock}
                    otherUser={otherUser}
                />
            )}
        </div>
    );
};

export default DmView;