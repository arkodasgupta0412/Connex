import { Dialog, DialogTitle, DialogContent, Typography, Switch, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './DmSettingsModal.css';


const DmSettingsModal = ({ isOpen, onClose, isBlockedByMe, onToggleBlock, otherUser }) => {
    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose} 
            slotProps={{ paper: { className: 'dm-settings-paper' } }}
        >
        
            <DialogTitle className="dm-settings-title">
                <Typography variant="h6">Chat Settings</Typography>
                <IconButton onClick={onClose} className="dm-settings-close-btn">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent className="dm-settings-content">
                <Typography>Block {otherUser}</Typography>
                <Switch 
                    checked={isBlockedByMe} 
                    onChange={(e) => onToggleBlock(e.target.checked)} 
                    color="error" 
                />
            </DialogContent>

        </Dialog>
    );
};

export default DmSettingsModal;