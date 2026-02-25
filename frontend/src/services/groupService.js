import api from './api'

const groupService = {
    fetchAllGroups: async (username) => {
        const response = await api.get(`/groups/${username}`);
        return response.data;
    },


    createGroup: async (groupName, createrUsername) => {
        const payload = {
            groupName: groupName,
            creator: createrUsername
        };
        const response = await api.post('/groups/create', payload);
        return response.data;
    },


    requestJoin: async(groupId, username) => {
        const payload = {
            groupId: groupId,
            username: username
        };
        const response = await api.post('/groups/request', payload);
        return response.data;
    },


    acceptRequest: async(groupId, username) => {
        const payload = {
            groupId: groupId,
            username: username
        };
        const response = await api.post('/groups/request/accept', payload);
        return response.data;
    },


    rejectRequest: async(groupId, username) => {
        const payload = {
            groupId: groupId,
            username: username
        };
        const response = await api.post('/groups/request/reject', payload);
        return response.data;
    }
};

export default groupService;