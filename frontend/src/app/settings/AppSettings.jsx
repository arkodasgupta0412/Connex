import { useState } from 'react';

import Sidebar from '../../components/sidebar/Sidebar';
import SettingsSection from '../../components/settings/SettingsSection/SettingsSection';
import ThemeModal from '../../components/settings/ThemeModal/ThemeModal';
import './AppSettings.css';

const AppSettings = ({ isOpen, onClose, theme, onThemeChange, onLogout }) => {
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    
    return (
        <Sidebar isOpen={isOpen} onClose={onClose} title="App Settings">
            <div className="settings-list">
                <SettingsSection 
                    title="Account"
                    description="Manage your profile and privacy"
                    onClick={() => alert("Account settings coming soon!")}
                    showArrow={true}
                />

                <SettingsSection 
                    title="Notifications"
                    description="Configure alerts and sounds"
                    onClick={() => alert("Notification settings coming soon!")}
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

            <ThemeModal 
                isOpen={themeModalOpen}
                onClose={() => setThemeModalOpen(false)}
                currentTheme={theme}
                onThemeChange={onThemeChange}
            />
        </Sidebar>
    );
};

export default AppSettings;