import './Button.css';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    className = '', 
    ...props 
}) => {
    return (
        <button 
            className={`btn btn-${variant} btn-${size} ${className}`} 
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? '...' : children}
        </button>
    );
};

export default Button;