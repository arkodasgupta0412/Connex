import './Avatar.css';

const Avatar = ({ name, src, size = 'md' }) => {
    const initials = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className={`avatar avatar-${size}`}>
            {src ? (
                <img src={src} alt={name} className="avatar-img" />
            ) : (
                <span className="avatar-text">{initials}</span>
            )}
        </div>
    );
};

export default Avatar;