import Modal from '../../components/modal/Modal';
import Button from '../../components/button/Button';
import { AVAILABLE_THEMES } from '../../config/themes';


const ThemeSelector = ({ isOpen, onClose, currentTheme, onSelectTheme }) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Choose Theme"
            footer={
                <Button variant="secondary" onClick={onClose}>Close</Button>
            }
        >
            <div className="theme-grid">
                {AVAILABLE_THEMES.map(t => (
                    <button
                        key={t.id}
                        onClick={() => onSelectTheme(t.id)}
                        className={`theme-btn ${currentTheme === t.id ? 'active' : ''}`}
                    >
                        {/* Dynamic background color */}
                        <div 
                            className="theme-color-preview" 
                            style={{ backgroundColor: t.color }} 
                        />
                        <span className={`theme-name ${currentTheme === t.id ? 'active' : ''}`}>
                            {t.name}
                        </span>
                    </button>
                ))}
            </div>
        </Modal>
    );
};

export default ThemeSelector;