import api from './api';

const uploadService = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("photo", file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    }
}

export default uploadService;