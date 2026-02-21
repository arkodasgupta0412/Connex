import Modal from '../../modal/Modal';
import { AVAILABLE_THEMES, THEME_COLORS } from '../../../config/themes';
import './ThemeModal.css';

const ThemeModal = ({ isOpen, onClose, currentTheme, onThemeChange }) => {
    
    const handleThemeSelect = (themeId) => {
        onThemeChange(themeId);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Theme">
            <div className="theme-modal-grid">
                {AVAILABLE_THEMES.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`theme-modal-option ${currentTheme === theme.id ? 'active' : ''}`}
                        title={theme.name}
                    >
                        {/* THEME PREVIEW RECTANGLE */}
                        <div 
                            className="theme-preview-rect"
                        >
                            <div 
                                className="theme-rect-bg"
                                style={{ backgroundColor: theme.bgColor }}
                            />
                            <div 
                                className="theme-rect-fg"
                                style={{ backgroundColor: THEME_COLORS[theme.id] }}
                            />
                        </div>
                        
                        <span className="theme-modal-name">{theme.name}</span>
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default ThemeModal;