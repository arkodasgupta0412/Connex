import api from './api';

const dmService = {
    
    fetchUserDMs: async (username) => {
        const response = await api.get(`/dms/${username}`);
        return response.data;
    },


    initiateDM: async (user1, user2) => {
        const response = await api.post('/dms/initiate', { user1, user2 });
        return response.data;
    },


    toggleBlock: async (dmId, username, blockStatus) => {
        const response = await api.patch(`/dms/${dmId}/block`, { username, block: blockStatus });
        return response.data;
    }
};

export default dmService;