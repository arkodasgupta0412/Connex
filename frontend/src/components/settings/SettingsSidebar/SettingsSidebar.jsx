import { useState } from 'react';
import Sidebar from '../../sidebar/Sidebar';
import SettingsSection from '../SettingsSection/SettingsSection';
import ThemeModal from '../ThemeModal/ThemeModal';
import './SettingsSidebar.css';

const SettingsSidebar = ({ isOpen, onClose, theme, onThemeChange }) => {
    
    const [themeModalOpen, setThemeModalOpen] = useState(false);
    
    return (
        <Sidebar 
            isOpen={isOpen}
            onClose={onClose}
            title="Settings"
        >
            <div className="settings-list">
                {/* Theme Section */}
                <SettingsSection 
                    title="Themes"
                    description="Choose your preferred theme"
                    onClick={() => setThemeModalOpen(true)}
                    showArrow={false}
                >
                </SettingsSection>

                {/* Example of a non-clickable section (Privacy) */}
                {/* <SettingsSection 
                    title="Privacy" 
                    description="Manage your data settings"
                    showArrow={true}
                /> 
                */}
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

export default SettingsSidebar;