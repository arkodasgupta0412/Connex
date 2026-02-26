import { useState, useEffect } from 'react';
import { TextField, Button, IconButton, Select, MenuItem, InputLabel, FormControl, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';

import userService from '../../../services/userService';
import uploadService from '../../../services/uploadService';
import './UserSettings.css';


const UserSettings = ({ isOpen, onClose, username }) => {
    const [profile, setProfile] = useState({
        avatarUrl: '',
        bannerUrl: '',
        bio: '',
        status: 'online',
        profileName: username
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (isOpen && username) {
            loadProfile();
        }
    }, [isOpen, username]);


    const loadProfile = async () => {
        try {
            const data = await userService.getProfile(username);
            if (data.success) {
                setProfile(prev => ({ ...prev, ...data.user }));
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };


    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setMessage({ text: `Uploading ${type}...`, type: 'info' });

        try {
            const formData = new FormData();
            formData.append('photo', file); 
            formData.append('username', username);
            formData.append('context', type === 'avatar' ? 'user_avatar' : 'user_banner');

            const response = await uploadService.uploadProfileMedia(formData); 
            
            if (response.success) {
                setProfile({ 
                    ...profile, 
                    [type === 'avatar' ? 'avatarUrl' : 'bannerUrl']: response.photoUrl 
                });
                setMessage({ text: `${type} uploaded!`, type: 'success' });
            } else {
                setMessage({ text: response.message || `Failed to upload ${type}`, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: `Server error uploading ${type}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const handleRemoveImage = async (type) => {
        const urlToRemove = type === 'avatar' ? profile.avatarUrl : profile.bannerUrl;
        if (!urlToRemove) return;

        setLoading(true);
        setMessage({ text: `Removing ${type}...`, type: 'info' });

        try {
            await uploadService.deleteProfileMedia(urlToRemove);
            
            setProfile(prev => ({
                ...prev,
                [type === 'avatar' ? 'avatarUrl' : 'bannerUrl']: ''
            }));
            
            setMessage({ text: `${type} removed.`, type: 'success' });

        } catch (error) {
            console.error("Delete Error:", error);
            setMessage({ text: `Failed to remove ${type} from database.`, type: 'error' });

        } finally {
            setLoading(false);
        }
    };


    const handleSave = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const data = await userService.updateProfile(username, profile);

            if (data.success && data.user) {
                setProfile({
                    avatarUrl: data.user.avatarUrl || '',
                    bannerUrl: data.user.bannerUrl || '',
                    bio: data.user.bio || '',
                    status: data.user.status || 'online',
                    profileName: data.user.profileName || username
                });
                setMessage({ text: 'Profile updated successfully!', type: 'success' });

                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                    onClose();
                }, 1500);
            } else {
                setMessage({ text: 'Failed to update profile.', type: 'error' });
            }

        } catch (error) {
            console.error("Save Profile Error:", error.response?.data || error.message);
            const serverMessage = error.response?.data?.message || 'Failed to connect to /users';
            setMessage({ text: `Error: ${serverMessage}`, type: 'error' });

        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;


    const commonInputStyles = {
        '& .MuiOutlinedInput-root': {
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-primary)',
            '& fieldset': { borderColor: 'rgba(128, 132, 142, 0.3)' },
            '&:hover fieldset': { borderColor: 'var(--text-secondary)' },
            '&.Mui-focused fieldset': { borderColor: '#5865F2' },
        },
        '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
        '& .MuiInputLabel-root.Mui-focused': { color: '#5865F2' },
        '& .MuiInputBase-input::placeholder': { color: 'var(--text-secondary)', opacity: 0.6 }
    };

    const menuProps = {
        style: { zIndex: 100000 },
        PaperProps: {
            sx: {
                bgcolor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                '& .MuiMenuItem-root:hover': { bgcolor: 'rgba(128, 132, 142, 0.1)' }
            }
        }
    };


    return (
        <div className="modal-overlay">
            <div className="user-settings-modal">
                
                {/* MUI Icon Button for Close */}
                <IconButton 
                    onClick={onClose} 
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                >
                    <CloseIcon />
                </IconButton>

                {/* BANNER UPLOAD */}
                <div className="banner-container">
                    {profile.bannerUrl ? (
                        <>
                            <img src={profile.bannerUrl} alt="Banner" className="banner-img" />
                            <IconButton 
                                    onClick={() => handleRemoveImage('banner')}
                                    sx={{ 
                                        position: 'absolute', 
                                        top: 8, left: 8, 
                                        zIndex: 10, 
                                        bgcolor: 'rgba(0,0,0,0.5)', 
                                        color: 'white', 
                                        '&:hover': { bgcolor: 'rgba(237, 66, 69, 0.9)' } 
                                    }}
                                    size="small"
                                    title="Remove Banner"
                                >
                                    <DeleteIcon fontSize="small" />
                            </IconButton>
                        </>
                    ) : (
                        <div className="banner-placeholder">No Banner</div>
                    )}
                    <label className="banner-upload-overlay">
                        <PhotoCameraIcon sx={{ fontSize: 32, color: 'white' }} />
                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                    </label>
                </div>

                {/* AVATAR UPLOAD */}
                <div className="avatar-container">
                    <div className="avatar-wrapper">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="avatar-img" />
                        ) : (
                            <div className="avatar-placeholder">
                                {profile.profileName ? profile.profileName.charAt(0).toUpperCase() : '?'}
                            </div>
                        )}
                        <label className="avatar-upload">
                            <PhotoCameraIcon fontSize="large" sx={{ color: 'white' }} />
                            <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                        </label>
                    </div>
                    
                    {profile.avatarUrl && (
                        <IconButton 
                            onClick={() => handleRemoveImage('avatar')}
                            sx={{ 
                                position: 'absolute', 
                                bottom: -5, 
                                left: -5, 
                                zIndex: 10, 
                                bgcolor: 'var(--bg-secondary)', 
                                color: 'var(--text-secondary)', 
                                border: '2px solid var(--bg-primary)', 
                                padding: '2px',
                                pointerEvents: 'auto',
                                '&:hover': { bgcolor: 'rgba(237, 66, 69, 0.9)', color: 'white' } 
                            }}
                            size="small"
                            title="Remove Avatar"
                        >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    )}

                    <div className={`status-badge ${profile.status}`}></div>
                </div>

                {/* FORM AREA  */}
                <div className="form-content">
                    <TextField
                        fullWidth
                        label="Profile Name"
                        name="profileName"
                        value={profile.profileName}
                        onChange={handleChange}
                        variant="outlined"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={commonInputStyles}
                    />

                    <FormControl fullWidth sx={commonInputStyles}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={profile.status}
                            label="Status"
                            onChange={handleChange}
                            displayEmpty
                            MenuProps={menuProps}
                            sx={{ '& .MuiSelect-select': { display: 'flex', alignItems: 'center' } }}
                        >
                            <MenuItem value="online">
                                <CircleIcon sx={{ color: '#23a559', fontSize: 14, mr: 1.5 }} /> Online
                            </MenuItem>
                            <MenuItem value="idle">
                                <CircleIcon sx={{ color: '#f0b232', fontSize: 14, mr: 1.5 }} /> Idle
                            </MenuItem>
                            <MenuItem value="dnd">
                                <CircleIcon sx={{ color: '#f23f43', fontSize: 14, mr: 1.5 }} /> Do Not Disturb
                            </MenuItem>
                            <MenuItem value="invisible">
                                <CircleIcon sx={{ color: '#80848e', fontSize: 14, mr: 1.5 }} /> Invisible
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={profile.bio}
                        onChange={handleChange}
                        variant="outlined"
                        multiline
                        rows={3}
                        placeholder="Tell us about yourself..."
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={commonInputStyles}
                    />

                    {message.text && (  
                        <div className={`message ${message.type}`}>{message.text}</div>
                    )}
                </div>

                {/* MUI ACTION BUTTONS */}
                <div className="modal-actions">
                    <Button onClick={onClose} disabled={loading} color="inherit" sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading} 
                        variant="contained" 
                        color="primary"
                        sx={{ textTransform: 'none', fontWeight: 'bold' }}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;