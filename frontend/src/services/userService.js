import api from './api';

const userService = {

    // Fetch the user's current profile data
    getProfile: async (username) => {
        const response = await api.get(`/users/${username}`);
        return response.data;
    },

    
    // Update the user's profile
    updateProfile: async (username, profileData) => {
        const response = await api.patch(`/users/${username}/profile`, profileData);
        return response.data;
    },


    // user-specific notifications
    getNotifications: async (username) => {
        const response = await api.get(`/users/${username}/notifications`);
        return response.data;
    },


    markNotificationsRead: async (username) => {
        const response = await api.put(`/users/${username}/notifications/read`);
        return response.data;
    },

    
    clearNotifications: async (username) => {
        const response = await api.delete(`/users/${username}/notifications`);
        return response.data;
    }
};

export default userService;