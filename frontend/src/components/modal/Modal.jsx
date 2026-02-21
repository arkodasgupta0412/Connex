import Button from '../button/Button';
import './Modal.css';

import CloseIcon from '@mui/icons-material/Close';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <CloseIcon />
                    </Button>
                </div>
                
                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;