import api from './api'

const authService = {
    login: async (formData) => {
        const payload = {
            username: formData.username,
            password: formData.password
        };
        const response = await api.post('/login', payload);
        return response.data;
    },

    signup: async (formData) => {
        const payload = {
            username: formData.username,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            securityAnswer: formData.securityAnswer,
            profileName: formData.profileName
        };
        const response = await api.post('/signup', payload);
        return response.data;
    },

    resetPassword: async (resetData) => {
        const payload = {
            username: resetData.username,
            newPassword: resetData.password,
            confirmNewPassword: resetData.confirmPassword,
            securityAnswer: resetData.securityAnswer
        };
        const response = await api.post('/forgot-password', payload);
        return response.data;
    }
}

export default authService;