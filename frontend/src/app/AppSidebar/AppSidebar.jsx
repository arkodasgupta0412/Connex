import { useState } from 'react';

import './AppSidebar.css';

// Icons
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ForumIcon from '@mui/icons-material/Forum';             // Group
import PersonIcon from '@mui/icons-material/Person';           // DM
import TagIcon from '@mui/icons-material/Tag';                 // Thread
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed'; // Feed
import SettingsIcon from '@mui/icons-material/Settings';       // Settings


const AppSidebar = ({ onOpenSettings }) => {
    const [activeView, setActiveView] = useState('group');

    return (
        <div className="app-sidebar-wrapper">
            <div className="app-sidebar">
                
                {/* Collapsed State: ">>" Icon */}
                <div className="sidebar-trigger">
                    <KeyboardDoubleArrowRightIcon fontSize="small" />
                </div>

                {/* Expanded State: App Icons */}
                <div className="sidebar-icons">
                    <button 
                        className={`app-icon-btn ${activeView === 'group' ? 'active' : ''}`}
                        onClick={() => setActiveView('group')}
                        title="Groups"
                    >
                        <ForumIcon />
                    </button>

                    <button 
                        className={`app-icon-btn ${activeView === 'dm' ? 'active' : ''}`}
                        onClick={() => setActiveView('dm')}
                        title="Direct Messages"
                    >
                        <PersonIcon />
                    </button>

                    <button 
                        className={`app-icon-btn ${activeView === 'thread' ? 'active' : ''}`}
                        onClick={() => setActiveView('thread')}
                        title="Threads"
                    >
                        <TagIcon />
                    </button>

                    <button 
                        className={`app-icon-btn ${activeView === 'feed' ? 'active' : ''}`}
                        onClick={() => setActiveView('feed')}
                        title="Feed"
                    >
                        <DynamicFeedIcon />
                    </button>

                    {/* Pushes the settings gear to the bottom */}
                    <div className="spacer"></div>

                    <button 
                        className="app-icon-btn"
                        onClick={onOpenSettings}
                        title="Settings"
                    >
                        <SettingsIcon />
                    </button>
                </div>
                
            </div>
        </div>
    );
};

export default AppSidebar;