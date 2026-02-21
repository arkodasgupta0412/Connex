import CloseIcon from '@mui/icons-material/Close';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, title, children }) => {
    
    return (
        <>
            {/* BACKDROP */}
            <div 
                className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* SIDEBAR */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* HEADER */}
                <div className="sidebar-header">
                    <h3 className="sidebar-title">{title}</h3>
                    <button 
                        className="sidebar-close-btn"
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="sidebar-content">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Sidebar;