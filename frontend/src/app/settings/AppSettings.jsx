import { useState } from 'react';
import { Badge } from '@mui/material'; // <--- Ensure Badge is imported

import Sidebar from '../../components/sidebar/Sidebar';
import SettingsSection from '../../components/settings/SettingsSection/SettingsSection';
import ThemeModal from '../../components/settings/ThemeModal/ThemeModal';
import UserSettings from '../../components/settings/UserSettings/UserSettings';
import NotificationModal from './NotificationModal';
import './AppSettings.css';


const AppSettings = ({ 
    isOpen, onClose, theme, onThemeChange, currentUser, onLogout, 
    notifications = [], hasUnseen, onOpenNotifications, onClearNotifications 
}) => {
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    const [accountModalOpen, setAccountModalOpen] = useState(false);
    const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);


    const handleNotificationsClick = () => {
        if (onOpenNotifications) onOpenNotifications();
        setNotificationsModalOpen(true);
    };
    
    return (
        <>
            <Sidebar isOpen={isOpen} onClose={onClose} title="App Settings">
                <div className="settings-list">
                    <SettingsSection 
                        title="Account"
                        description="Manage your profile and privacy"
                        onClick={() => setAccountModalOpen(true)}
                        showArrow={true}
                    />

                    
                    <SettingsSection 
                        title={
                            <div className="settings-badge-wrapper">
                                Notifications
                                <Badge color="error" variant="dot" invisible={!hasUnseen} />
                            </div>
                        }
                        description="Configure alerts and sounds"
                        onClick={handleNotificationsClick}
                        showArrow={true}
                    />
                    
                    <SettingsSection 
                        title="Themes"
                        description="Choose your preferred theme"
                        onClick={() => setThemeModalOpen(true)}
                    />
                </div>
                
                <div className="app-settings-footer">
                    <button className="btn-logout-full" onClick={onLogout}>
                        Sign Out
                    </button>
                </div>
            </Sidebar>

            <ThemeModal 
                isOpen={themeModalOpen}
                onClose={() => setThemeModalOpen(false)}
                currentTheme={theme}
                onThemeChange={onThemeChange}
            />

            <UserSettings 
                isOpen={accountModalOpen}
                onClose={() => setAccountModalOpen(false)}
                username={currentUser} 
            />

            {/* 4. RENDERING NOTIFICATION MODAL */}
            <NotificationModal
                isOpen={notificationsModalOpen}
                onClose={() => setNotificationsModalOpen(false)}
                notifications={notifications}
                onClear={onClearNotifications}
            />
        </>
    );
};

export default AppSettings;