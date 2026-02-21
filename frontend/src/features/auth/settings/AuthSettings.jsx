import { useState } from 'react';

import Sidebar from '../../../../components/sidebar/Sidebar';
import SettingsSection from '../../../../components/settings/SettingsSection/SettingsSection';
import ThemeModal from '../../../../components/settings/ThemeModal/ThemeModal';
import './AuthSettings.css';

const AuthSettings = ({ isOpen, onClose, theme, onThemeChange }) => {
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    
    return (
        <Sidebar isOpen={isOpen} onClose={onClose} title="Appearance">
            <div 
                className="auth-settings-list" 
                style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}    
            >
                <SettingsSection 
                    title="Themes"
                    description="Choose your preferred theme"
                    onClick={() => setThemeModalOpen(true)}
                />
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

export default AuthSettings;