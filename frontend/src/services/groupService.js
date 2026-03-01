import api from './api'

const groupService = {

    fetchAllGroups: async (username) => {
        const response = await api.get(`/groups/${username}`);
        return response.data;
    },


    createGroup: async (groupData) => {
        const response = await api.post('/groups/create', groupData);
        return response.data;
    },


    searchGroups: async (query) => {
        const response = await api.get(`/groups/search/public?q=${query}`);
        return response.data;
    },


    joinByCode: async (code, username) => {
        const response = await api.post('/groups/join/code', { code, username });
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
    },


    leaveGroup: async (groupId, username) => {
        const response = await api.post('/groups/leave', { 
            groupId, 
            username 
        });
        return response.data;
    },


    updateGroupInfo: async (groupId, data) => {
        const response = await api.put(`/groups/${groupId}/info`, data);
        return response.data;
    },


    updatePermissions: async (groupId, adminUsername, membersCanEditInfo) => {
        const response = await api.put(`/groups/${groupId}/permissions`, { adminUsername, membersCanEditInfo });
        return response.data;
    },


    updateNickname: async (groupId, username, nickname) => {
        const response = await api.put(`/groups/${groupId}/nickname`, { username, nickname });
        return response.data;
    },

    
    changeRole: async (groupId, adminUsername, targetUser, action) => {
        const response = await api.put(`/groups/${groupId}/role`, { adminUsername, targetUser, action });
        return response.data;
    }
};

export default groupService;