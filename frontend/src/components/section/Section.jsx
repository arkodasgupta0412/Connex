import './Section.css';

const Section = ({ 
    title, 
    description, 
    children 
}) => {
    return (
        <div className="section">
            <div className="section-header">
                <h4 className="section-title">{title}</h4>
                {description && (
                    <p className="section-description">{description}</p>
                )}
            </div>
            <div className="section-content">
                {children}
            </div>
        </div>
    );
};

export default Section;
