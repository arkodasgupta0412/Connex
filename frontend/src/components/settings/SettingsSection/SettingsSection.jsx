import './SettingsSection.css';

const SettingsSection = ({ title, description, onClick, children, showArrow = false }) => {
    return (
        <div 
            className={`settings-section ${onClick ? 'interactive' : ''}`} 
            onClick={onClick}
        >
            <div className="section-content">
                <div className="section-info">
                    <h4 className="section-title">{title}</h4>
                    {description && <p className="section-desc">{description}</p>}
                </div>
                
                <div className="section-right">
                    {children}
                    {showArrow && <span className="section-arrow">›</span>}
                </div>
            </div>
        </div>
    );
};

export default SettingsSection;