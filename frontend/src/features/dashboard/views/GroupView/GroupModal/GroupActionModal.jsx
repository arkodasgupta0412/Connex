import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Tabs, Tab, 
    TextField, Button, IconButton, CircularProgress, 
    InputAdornment, List, ListItem, ListItemText, Divider 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SearchIcon from '@mui/icons-material/Search';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import groupService from '../../../../../services/groupService';

import './GroupActionModal.css';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <div style={{ paddingTop: '24px' }}>{children}</div>}
        </div>
    );
}

const GroupActionModal = ({ isOpen, onClose, currentUser, onGroupCreated }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Create State
    const [createName, setCreateName] = useState('');
    const [createDesc, setCreateDesc] = useState('');

    // Join State
    const [joinCode, setJoinCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setTabIndex(0);
            setCreateName('');
            setCreateDesc('');
            setJoinCode('');
            setSearchQuery('');
            setSearchResults([]);
            setMessage({ text: '', type: '' });
        }
    }, [isOpen]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setMessage({ text: '', type: '' });
    };


    // --- API Handlers ---
    const handleCreateGroup = async () => {
        if (!createName.trim()) 
            return setMessage({ text: "Group name is required", type: "error" });
        
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await groupService.createGroup({
                name: createName,
                description: createDesc,
                creator: currentUser
            });

            if (response.success) {
                setMessage({ text: "Group created successfully!", type: "success" });
                onGroupCreated();
                setTimeout(onClose, 1000);
            } else {
                setMessage({ text: "Failed to create group", type: "error" });
            }

        } catch (error) {
            setMessage({ text: "Failed to create group. Server error.", type: "error" });
        } finally {
            setLoading(false);
        }
    };


    const handleJoinByCode = async () => {
        if (joinCode.length !== 6) 
            return setMessage({ text: "Code must be 6 characters", type: "error" });
        
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await groupService.joinByCode(joinCode, currentUser);
            
            if (response.success) {
                setMessage({ text: response.message, type: "success" });
                setJoinCode('');
            } else {
                setMessage({ text: response.message || "Failed to join", type: "error" });
            }

        } catch (error) {
            const errorMsg = error.response?.data?.message || "Invalid code or group not found";
            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };


    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const results = await groupService.searchGroups(searchQuery);
            setSearchResults(results);

            if (results.length === 0) {
                setMessage({ text: "No groups found matching that name.", type: "error" });
            }

        } catch (error) {
            setMessage({ text: "Error searching groups", type: "error" });
        } finally {
            setLoading(false);
        }
    };


    const handleRequestToJoin = async (groupId) => {
        setLoading(true);
        try {
            const response = await groupService.requestJoin(groupId, currentUser);
            if (response.success) {
                setMessage({ text: "Join request sent to Admins!", type: "success" });
            } else {
                setMessage({ text: "Failed to send request", type: "error" });
            }
        } catch (error) {
            setMessage({ text: "Error sending join request", type: "error" });
        } finally {
            setLoading(false);
        }
    };


    return (
        <Dialog open={isOpen} onClose={onClose} classes={{ paper: 'action-modal-paper' }}>
            <DialogTitle className="action-modal-header">
                <span className="action-modal-title-text">Group Actions</span>
                <IconButton onClick={onClose} className="action-modal-close-btn">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <div className="action-modal-tabs-container">
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Create Group" className="action-modal-tab" />
                    <Tab label="Join Group" className="action-modal-tab" />
                </Tabs>
            </div>

            <DialogContent className="action-modal-content">
                
                {message.text && (
                    <div className={`modal-message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* --- TAB 1: CREATE GROUP --- */}
                <CustomTabPanel value={tabIndex} index={0}>
                    <TextField
                        fullWidth
                        label="Group Name"
                        variant="outlined"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        className="action-modal-input"
                    />
                    <TextField
                        fullWidth
                        label="Description (Optional)"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={createDesc}
                        onChange={(e) => setCreateDesc(e.target.value)}
                        className="action-modal-input"
                    />
                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={handleCreateGroup}
                        disabled={loading}
                        className="action-btn-create"
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Group'}
                    </Button>
                </CustomTabPanel>

                {/* --- TAB 2: JOIN GROUP --- */}
                <CustomTabPanel value={tabIndex} index={1}>
                    
                    <div className="join-section-title">Have an invite code?</div>
                    <div className="join-input-row">
                        <TextField
                            fullWidth
                            placeholder="Enter 6-digit code"
                            variant="outlined"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.substring(0, 6))}
                            className="action-modal-input"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VpnKeyIcon style={{ color: 'var(--text-secondary)' }} />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                        <Button 
                            variant="contained" 
                            onClick={handleJoinByCode}
                            disabled={loading || joinCode.length !== 6}
                            className="action-btn-join"
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Join'}
                        </Button>
                    </div>

                    <Divider className="action-modal-divider">
                        <span className="divider-text">OR</span>
                    </Divider>

                    <div className="join-section-title">Search Public Groups</div>
                    <div className="join-input-row">
                        <TextField
                            fullWidth
                            placeholder="Search by group name..."
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="action-modal-input"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon style={{ color: 'var(--text-secondary)' }} />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                        <Button 
                            variant="outlined" 
                            onClick={handleSearch}
                            disabled={loading || !searchQuery.trim()}
                            className="action-btn-search"
                        >
                            Search
                        </Button>
                    </div>

                    {searchResults.length > 0 && (
                        <List className="search-results-list">
                            {searchResults.map((group) => (
                                <ListItem 
                                    key={group._id}
                                    className="search-result-item"
                                    secondaryAction={
                                        <IconButton 
                                            edge="end" 
                                            className="request-join-icon" 
                                            title="Request to Join"
                                            onClick={() => handleRequestToJoin(group._id)}
                                            disabled={loading}
                                        >
                                            <GroupAddIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText 
                                        primary={group.name} 
                                        secondary={group.description || 'No description'}
                                        classes={{ primary: 'search-result-primary', secondary: 'search-result-secondary' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </CustomTabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default GroupActionModal;