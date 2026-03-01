import api from './api';

const uploadService = {
    
    uploadChatImage: async (file) => {
        const formData = new FormData();
        formData.append("photo", file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    },


    uploadProfileMedia: async (profileData) => {
        const response = await api.post('/upload', profileData, {
            headers: { 
                'Content-Type': 'multipart/form-data' 
            }
        });
        return response.data;
    },


    deleteProfileMedia: async (fileUrl) => {
        const response = await api.delete('/upload', { 
            data: { fileUrl } 
        });
        return response.data;
    },


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
}

export default uploadService;