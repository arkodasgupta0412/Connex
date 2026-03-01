import { useState, useEffect } from 'react';
import AppSidebar from '../../../app/AppSidebar/AppSidebar';
import AppSettings from '../../../app/settings/AppSettings'; 

import GroupView from '../views/GroupView/GroupView';
import DMView from '../views/DmView/DmView';
import ThreadView from '../views/ThreadView/ThreadView';
import FeedView from '../views/FeedView/FeedView';

import { socket } from '../../chat/GroupChat/GroupChat';
import userService from '../../../services/userService';

import './Layout.css';

const Layout = ({ user, onLogout, theme, onThemeChange }) => {
    const [activeView, setActiveView] = useState('group'); 
    const [showSettings, setShowSettings] = useState(false);

    // --- Notification State ---
    const [notifications, setNotifications] = useState([]);
    const [hasUnseen, setHasUnseen] = useState(false);
    const [forceSidebarOpen, setForceSidebarOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            
            const handleNewNotification = () => {
                fetchNotifications();
                
                // Auto-expand the sidebar for 4 seconds!
                setForceSidebarOpen(true);
                setTimeout(() => setForceSidebarOpen(false), 4000);
            };

            socket.on('new_notification', handleNewNotification);
            return () => {
                socket.off('new_notification', handleNewNotification);
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const data = await userService.getNotifications(user);
            setNotifications(data);
            setHasUnseen(data.some(n => !n.isRead));
        } catch (err) { console.error("Failed to fetch notifications", err); }
    };

    const handleOpenNotificationsModal = async () => {
        setHasUnseen(false); 
        try {
            await userService.markNotificationsRead(user);
            fetchNotifications(); 
        } catch (err) { console.error("Failed to mark notifications read", err); }
    };

    const handleClearNotifications = async () => {
        try {
            await userService.clearNotifications(user);
            setNotifications([]);
            setHasUnseen(false);
        } catch (err) { console.error("Failed to clear notifications", err); }
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'group': return <GroupView user={user} theme={theme} />;
            case 'dm':    return <DMView user={user} theme={theme} />;
            case 'thread':return <ThreadView user={user} theme={theme} />;
            case 'feed':  return <FeedView user={user} theme={theme} />;
            default:      return <GroupView user={user} theme={theme} />;
        }
    };

    return (
        <div className="layout-container">
            <AppSidebar 
                activeView={activeView}
                setActiveView={setActiveView}
                onOpenSettings={() => setShowSettings(true)} 
                hasUnseen={hasUnseen}
                forceOpen={forceSidebarOpen}
            />

            <div className="main-content">
                {renderActiveView()}
            </div>

            <AppSettings 
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                theme={theme}
                onThemeChange={onThemeChange}
                currentUser={user}
                onLogout={onLogout}
                notifications={notifications}
                hasUnseen={hasUnseen}
                onOpenNotifications={handleOpenNotificationsModal}
                onClearNotifications={handleClearNotifications}
            />
        </div>
    );
};

export default Layout;