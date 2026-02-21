import { useState } from 'react';
import AppSidebar from '../../../../app/AppSidebar/AppSidebar';
import AppSettings from '../../../../app/settings/AppSettings'; 

import GroupView from '../../views/GroupView/GroupView';
import DMView from '../../views/DmView/DmView';
import ThreadView from '../../views/ThreadView/ThreadView';
import FeedView from '../../views/FeedView/FeedView';

import './Layout.css';

const Layout = ({ user, onLogout, theme, onThemeChange }) => {
    const [activeView, setActiveView] = useState('group'); 
    const [showSettings, setShowSettings] = useState(false);

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
            />

            <div className="main-content">
                {renderActiveView()}
            </div>

            <AppSettings 
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                theme={theme}
                onThemeChange={onThemeChange}
                onLogout={onLogout}
            />
        </div>
    );
};

export default Layout;