import api from './api'

const groupService = {
    fetchAllGroups: async (username) => {
        const response = await api.get(`/groups/${username}`);
        return response.data;
    },

    createGroup: async (groupName, createrUsername) => {
        const

        const response = await api.post(`/groups/create`)
    }
}