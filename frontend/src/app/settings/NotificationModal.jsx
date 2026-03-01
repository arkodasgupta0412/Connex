import { Dialog, DialogTitle, DialogContent, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, notifications, onClear }) => {

    return (

        <Dialog open={isOpen} onClose={onClose} classes={{ paper: 'notification-modal-paper' }} maxWidth="sm" fullWidth>

            <DialogTitle className="notification-modal-header">

                <div className="notification-modal-title-wrapper">
                    <NotificationsActiveIcon className="notification-icon" />
                    <span className="notification-modal-title-text">Notifications</span>
                </div>

                <IconButton onClick={onClose} className="notification-modal-close-btn">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>


            <DialogContent className="notification-modal-content">
                {notifications.length === 0 ? (
                    <div className="empty-notifications">
                        You have no new notifications.
                    </div>
                ) : (
                    <div className="notification-list">

                        {notifications.map((notif, index) => {
                            
                            let textClass = "";
                            const lowerText = notif.text.toLowerCase();
                            
                            if (lowerText.includes("accepted")) {
                                textClass = "notif-accepted";
                            } else if (lowerText.includes("rejected")) {
                                textClass = "notif-rejected";
                            }

                            return (
                                <div key={index} className="notification-item">
                                    
                                    <span className={`notification-text ${textClass}`}>
                                        {notif.text}
                                    </span>
                                    
                                    <span className="notification-time">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {notifications.length > 0 && (
                    <div className="notification-actions">
                        <Button 
                            variant="outlined" 
                            color="error" 
                            onClick={onClear} 
                            className="btn-clear-notifications"
                        >
                            Delete Notifications
                        </Button>
                    </div>
                )}
            </DialogContent>

        </Dialog>
    );
};

export default NotificationModal;