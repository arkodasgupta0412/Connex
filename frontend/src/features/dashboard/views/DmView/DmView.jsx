import { useState, useEffect, useRef } from 'react';
import DmSidebar from './DmSidebar/DmSidebar';
import DmChat from '../../../../features/chat/DmChat/DmChat';
import DmSettingsModal from './settings/DmSettingsModal';
import dmService from '../../../../services/dmService';
import './DmView.css';

const DmView = ({ user, theme }) => {
    const currentUsername = typeof user === 'object' ? user?.username : user;

    const [dms, setDms] = useState([]);
    const [selectedDm, setSelectedDm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Use a ref to track the open chat to prevent background fetches from restoring the badge
    const activeDmId = useRef(null);

    useEffect(() => {
        const fetchDms = async () => {
            if (!currentUsername) return;
            try {
                const data = await dmService.fetchUserDMs(currentUsername);
                
                // Protect the currently active DM from stale database badge data
                const sanitizedDms = (data || []).map(d => 
                    d.id === activeDmId.current ? { 
                        ...d, unreadCount: 0, unread: 0, unreadMessages: 0, hasUnread: false 
                    } : d
                );
                
                setDms(sanitizedDms);
            } catch (error) {
                console.error("Error fetching DMs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDms();
    }, [currentUsername]);

    const handleSelectDm = (dm) => {
        setSelectedDm(dm);
        setIsSettingsOpen(false);
        activeDmId.current = dm.id;

        
        setDms(prevDms => prevDms.map(d => 
            d.id === dm.id ? { 
                ...d, 
                unreadCount: 0, 
                unreadMessages: 0, 
                unread: 0,
                hasUnread: false,
                lastRead: { ...(d.lastRead || {}), [currentUsername]: new Date().toISOString() }
            } : d
        ));
    };

    const handleStartChat = async (searchUsername) => {
        if (!searchUsername || searchUsername === currentUsername) return;
        try {
            const res = await dmService.initiateDM(currentUsername, searchUsername);
            if (res?.success) {
                setDms(prevDms => {
                    const exists = prevDms.find(d => d.id === res.dm.id);
                    return exists ? prevDms : [res.dm, ...prevDms];
                });
                setSelectedDm(res.dm);
                activeDmId.current = res.dm.id;
            }
        } catch (error) {
            const realErrorMsg = error.response?.data?.message || "Server error occurred.";
            alert(`Error: ${realErrorMsg}`);
        }
    };

    const handleToggleBlock = async (blockStatus) => {
        if (!selectedDm) return;
        try {
            const updatedDmRoom = await dmService.toggleBlock(selectedDm.id, currentUsername, blockStatus);
            setDms(prevDms => prevDms.map(dm => 
                dm.id === updatedDmRoom.dm.id ? { ...dm, blockedBy: updatedDmRoom.dm.blockedBy } : dm
            ));
            setSelectedDm(prev => ({ ...prev, blockedBy: updatedDmRoom.dm.blockedBy }));
            setIsSettingsOpen(false);
        } catch (error) {
            console.error("Error toggling block:", error);
        }
    };

    const otherUser = selectedDm?.participants?.find(p => p !== currentUsername) || "Unknown";
    const isBlockedByMe = selectedDm?.blockedBy?.includes(currentUsername);

    return (
        <div className="dm-view-container">
            <div className="dm-sidebar-wrapper">
                {loading ? (
                    <div className="dm-loading">Loading chats...</div>
                ) : (
                    <DmSidebar 
                        dms={dms} 
                        currentUser={currentUsername} 
                        selectedDm={selectedDm} 
                        onSelectDm={handleSelectDm}
                        onStartChat={handleStartChat}
                    />
                )}
            </div>

            <div className="dm-chat-wrapper">
                {selectedDm ? (
                    <DmChat 
                        currentUser={currentUsername} 
                        dmRoom={selectedDm} 
                        otherUser={otherUser}
                        theme={theme}
                        onBack={() => { setSelectedDm(null); activeDmId.current = null; }} 
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