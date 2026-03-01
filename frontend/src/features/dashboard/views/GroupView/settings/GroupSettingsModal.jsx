import { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, Tabs, Tab, 
    Avatar, Typography, Button, IconButton, 
    List, ListItem, ListItemAvatar, ListItemText, Chip, TextField,
    Switch, Menu, MenuItem, Badge 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarsIcon from '@mui/icons-material/Stars';

import uploadService from '../../../../../services/uploadService';
import groupService from '../../../../../services/groupService';
import './GroupSettingsModal.css';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <div className="settings-tab-panel-box">{children}</div>}
        </div>
    );
}

const GroupSettingsModal = ({ isOpen, onClose, group, currentUser, onLeaveGroup, onGroupUpdated }) => {
    const [tabIndex, setTabIndex] = useState(0);

    // Editing State
    const [editDesc, setEditDesc] = useState("");
    const [membersCanEdit, setMembersCanEdit] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [removeBanner, setRemoveBanner] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    // Nickname State
    const [isEditingNick, setIsEditingNick] = useState(false);
    const [tempNick, setTempNick] = useState("");

    // Role Menu State
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        if (isOpen && group) {
            setTabIndex(0);
            setEditDesc(group.description || "");
            
            const canEdit = group.permissions?.membersCanEditGroupInfo || group.permissions?.membersCanEditInfo || false;
            setMembersCanEdit(canEdit);
            
            setAvatarPreview(null);
            setBannerPreview(null);
            setAvatarFile(null);
            setBannerFile(null);
            setRemoveAvatar(false);
            setRemoveBanner(false);
            setIsEditingNick(false);
        }
    }, [isOpen, group]);

    if (!group) return null;

    const isOwner = (Array.isArray(group.owner) ? group.owner.includes(currentUser) : group.owner === currentUser) || group.admins?.[0] === currentUser;
    const isAdmin = group.admins?.includes(currentUser);
    const canEditInfo = isAdmin || membersCanEdit;

    const formattedDate = new Date(group.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const hasChanges = 
        editDesc !== (group.description || "") || 
        membersCanEdit !== (group.permissions?.membersCanEditGroupInfo || group.permissions?.membersCanEditInfo || false) ||
        avatarPreview !== null || 
        bannerPreview !== null ||
        removeAvatar || 
        removeBanner;

    // --- Save Handlers ---
    const handleSaveChanges = async () => {
        const targetId = group.id || group._id; 
        
        let uploadedAvatarUrl = group.avatarUrl;
        let uploadedBannerUrl = group.bannerUrl;

        try {
            if (avatarFile) {
                const res = await uploadService.uploadChatImage(avatarFile);
                if (res.success) uploadedAvatarUrl = res.photoUrl; 
            }
            
            if (bannerFile) {
                const res = await uploadService.uploadChatImage(bannerFile);
                if (res.success) uploadedBannerUrl = res.photoUrl;
            }

            await groupService.updateGroupInfo(targetId, { 
                description: editDesc, 
                avatarUrl: removeAvatar ? "" : uploadedAvatarUrl,
                bannerUrl: removeBanner ? "" : uploadedBannerUrl,
                username: currentUser 
            });
            
            const currentPerms = group.permissions?.membersCanEditGroupInfo || group.permissions?.membersCanEditInfo || false;
            if (isAdmin && membersCanEdit !== currentPerms) {
                await groupService.updatePermissions(targetId, currentUser, membersCanEdit);
            }

            if (onGroupUpdated) onGroupUpdated();
            onClose();

        } catch (error) {
            console.error("Failed to save changes:", error);
            alert("There was an error saving your changes. Check the console for details.");
        }
    };

    const handleSaveNickname = async () => {
        if (!tempNick.trim()) return;
        await groupService.updateNickname(group._id, currentUser, tempNick);
        setIsEditingNick(false);
        if (onGroupUpdated) onGroupUpdated();
    };

    const handleRoleAction = async (action) => {
        await groupService.changeRole(group._id, currentUser, selectedMember, action);
        setAnchorEl(null);
        if (onGroupUpdated) onGroupUpdated();
    };

    // --- Request Handlers ---
    const handleAcceptRequest = async (username) => {
        try {
            await groupService.acceptRequest(group.id || group._id, username, currentUser);
            if (onGroupUpdated) onGroupUpdated();
        } catch (error) {
            console.error("Error accepting request", error);
        }
    };

    const handleRejectRequest = async (username) => {
        try {
            await groupService.rejectRequest(group.id || group._id, username, currentUser);
            if (onGroupUpdated) onGroupUpdated();
        } catch (error) {
            console.error("Error rejecting request", error);
        }
    };

    const currentAvatar = removeAvatar ? null : (avatarPreview || group.avatarUrl);
    const currentBanner = removeBanner ? null : (bannerPreview || group.bannerUrl || 'https://via.placeholder.com/600x150?text=No+Banner');

    return (
        <Dialog open={isOpen} onClose={onClose} classes={{ paper: 'settings-modal-paper' }} maxWidth="sm" fullWidth>
            <DialogTitle className="settings-modal-header">
                <span className="settings-modal-title-text">Group Settings</span>
                <IconButton onClick={onClose} className="settings-modal-close-btn">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <div className="settings-banner-container">
                <div className="settings-banner" style={{ backgroundImage: `url(${currentBanner})` }}></div>
                
                {canEditInfo && (
                    <div className="banner-overlay">
                        <IconButton component="label" className="edit-icon-btn">
                            <PhotoCameraIcon />
                            <input 
                                type="file" 
                                hidden 
                                accept="image/*" 
                                onChange={(e) => { 
                                    setBannerPreview(URL.createObjectURL(e.target.files[0])); 
                                    setBannerFile(e.target.files[0]);
                                    setRemoveBanner(false); 
                                }} 
                            />
                        </IconButton>
                        {currentBanner && currentBanner !== 'https://via.placeholder.com/600x150?text=No+Banner' && (
                            <IconButton onClick={() => { setBannerPreview(null); setRemoveBanner(true); }} className="delete-icon-btn">
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </div>
                )}

                <div className="settings-avatar-wrapper">
                    <Avatar src={currentAvatar} alt={group.name} className="settings-avatar">
                        {!currentAvatar && group.name.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    {canEditInfo && (
                        <div className="avatar-overlay">
                            <IconButton component="label" className="edit-icon-btn" size="small">
                                <PhotoCameraIcon fontSize="small" />
                                <input 
                                    type="file" 
                                    hidden 
                                    accept="image/*" 
                                    onChange={(e) => { 
                                        setAvatarPreview(URL.createObjectURL(e.target.files[0])); 
                                        setAvatarFile(e.target.files[0]);
                                        setRemoveAvatar(false); 
                                    }} 
                                />
                            </IconButton>
                            {currentAvatar && (
                                <IconButton onClick={() => { setAvatarPreview(null); setRemoveAvatar(true); }} className="delete-icon-btn" size="small">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="settings-modal-tabs-container">

                <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} variant="fullWidth">
                    <Tab label="Overview" className="settings-modal-tab" />
                    <Tab label={`Members (${group.members?.length || 0})`} className="settings-modal-tab" />
                    
                    {/* WRAP LABEL IN BADGE FOR RED DOT */}
                    {isAdmin && (
                        <Tab 
                            label={
                                <Badge 
                                    color="error" 
                                    variant="dot" 
                                    invisible={!group.joinRequests || group.joinRequests.length === 0}
                                    sx={{ '& .MuiBadge-badge': { right: -10, top: 5 } }}
                                >
                                    Requests ({group.joinRequests?.length || 0})
                                </Badge>
                            } 
                            className="settings-modal-tab" 
                        />
                    )}
                </Tabs>
            </div>

            <DialogContent className="settings-modal-content">
                
                <CustomTabPanel value={tabIndex} index={0}>
                 
                    <div className="overview-header">
                        <div>
                            <Typography variant="h5" className="overview-group-name">{group.name}</Typography>
                            <Chip label={`Code: ${group.groupCode}`} size="small" className="overview-group-code-chip"/>
                        </div>
                    </div>

                    <div className="overview-section">
                        <Typography variant="overline" className="overview-section-label">Description</Typography>
                        {canEditInfo ? (
                            <TextField
                                fullWidth multiline rows={3} variant="outlined"
                                value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                                placeholder="Add a description to tell people what this group is about..."
                                className="description-input"
                            />
                        ) : (
                            <Typography variant="body1" className="overview-section-body">
                                {group.description || "No description provided."}
                            </Typography>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="permissions-section">
                            <div className="permissions-text-block">
                                <span className="permissions-label">Member Permissions</span>
                                <span className="permissions-subtext">Allow members to edit avatar, banner, and description</span>
                            </div>
                            <Switch checked={membersCanEdit} onChange={(e) => setMembersCanEdit(e.target.checked)} color="primary" />
                        </div>
                    )}

                    <div className="overview-section">
                        <Typography variant="overline" className="overview-section-label">Created On</Typography>
                        <Typography variant="body2" className="overview-section-body">{formattedDate}</Typography>
                    </div>

                    <div className="overview-actions-container">
                        <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={() => onLeaveGroup(group._id)} className="leave-group-btn">
                            Leave Group
                        </Button>
                        {canEditInfo && hasChanges && (
                            <Button variant="contained" onClick={handleSaveChanges} className="save-changes-btn">
                                Save Changes
                            </Button>
                        )}
                    </div>
                </CustomTabPanel>

                <CustomTabPanel value={tabIndex} index={1}>
                    
                    <List className="members-list">
                        {group.members?.map((member) => {
                            const isUserOwner = (Array.isArray(group.owner) ? group.owner.includes(member) : group.owner === member) || group.admins?.[0] === member;
                            const isUserAdmin = group.admins?.includes(member);
                            const isCurrentUser = member === currentUser;
                            const nickname = group.nicknames?.[member] || member;

                            return (
                                <ListItem key={member} className="member-list-item">
                                    <ListItemAvatar>
                                        <Avatar className="member-avatar">{nickname.charAt(0).toUpperCase()}</Avatar>
                                    </ListItemAvatar>
                                    
                                    {isCurrentUser && isEditingNick ? (
                                        <div className="nickname-edit-container">
                                            <TextField 
                                                size="small" 
                                                value={tempNick} 
                                                onChange={(e) => setTempNick(e.target.value)} 
                                                autoFocus 
                                                className="description-input nickname-input-field" 
                                            />
                                            <IconButton color="success" onClick={handleSaveNickname} className="save-nick-btn">
                                                <CheckIcon />
                                            </IconButton>
                                        </div>
                                    ) : (
                                        <ListItemText 
                                            primary={
                                                <div className="member-name-wrapper">
                                                    <span>{nickname}</span>
                                                    {isCurrentUser && (
                                                        <IconButton size="small" onClick={() => { setIsEditingNick(true); setTempNick(nickname); }} className="edit-nick-btn">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </div>
                                            }
                                            secondary={`@${member} • ${isUserOwner ? 'Owner' : (isUserAdmin ? 'Admin' : 'Member')}`}
                                            classes={{ 
                                                primary: `member-name-text ${isCurrentUser ? 'current-user' : ''}`, 
                                                secondary: `member-role-text ${isUserOwner ? 'owner-role' : (isUserAdmin ? 'admin-role' : '')}` 
                                            }}
                                        />
                                    )}
                                    
                                    {isUserOwner && <StarsIcon className="role-icon owner-icon" titleAccess="Group Owner" />}
                                    {!isUserOwner && isUserAdmin && <AdminPanelSettingsIcon className="role-icon admin-icon" titleAccess="Group Admin" />}
                                    
                                    {isAdmin && !isUserOwner && !isCurrentUser && (
                                        <IconButton onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedMember(member); }}>
                                            <MoreVertIcon className="more-vert-icon" />
                                        </IconButton>
                                    )}
                                </ListItem>
                            );
                        })}
                    </List>
                </CustomTabPanel>

                {/* --- TAB 2: REQUESTS  --- */}
                {isAdmin && (
                    <CustomTabPanel value={tabIndex} index={2}>
                        {(!group.joinRequests || group.joinRequests.length === 0) ? (
                            <Typography className="requests-empty-text">
                                No pending join requests.
                            </Typography>
                        ) : (
                            <List className="members-list">
                                {group.joinRequests.map((requester) => (
                                    <ListItem key={requester} className="member-list-item">
                                        <ListItemAvatar>
                                            <Avatar className="member-avatar">{requester.charAt(0).toUpperCase()}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={requester} 
                                            secondary="Wants to join"
                                            classes={{ primary: 'member-name-text', secondary: 'member-role-text' }}
                                        />
                                        <div className="request-actions">
                                            <IconButton 
                                                onClick={() => handleAcceptRequest(requester)} 
                                                className="accept-req-btn"
                                                title="Accept"
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton 
                                                onClick={() => handleRejectRequest(requester)} 
                                                className="reject-req-btn"
                                                title="Reject"
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </div>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CustomTabPanel>
                )}

            </DialogContent>

            <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={() => setAnchorEl(null)} 
                PaperProps={{ className: 'role-menu-paper' }}
            >
                {group.admins?.includes(selectedMember) ? (
                    <MenuItem onClick={() => handleRoleAction('demote')} className="menu-item-demote">Demote to Member</MenuItem>
                ) : (
                    <MenuItem onClick={() => handleRoleAction('promote')} className="menu-item-promote">Promote to Admin</MenuItem>
                )}
            </Menu>
        </Dialog>
    );
};

export default GroupSettingsModal;