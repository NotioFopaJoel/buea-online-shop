import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// A dedicated instance (not the shared api.js one) because that instance sets
// a default 'Content-Type: application/json' header, which would override
// the multipart/form-data boundary axios needs to set automatically for file uploads.
const uploadApi = axios.create({ baseURL: API_URL });

uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('bos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

uploadApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Upload failed';
    return Promise.reject(new Error(message));
  }
);

export default {
  /**
   * Uploads a single image file (from a device photo picker / file input)
   * and returns { url } - an absolute URL ready to store on a product.
   */
  uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return uploadApi.post('/upload/image', formData);
  },
};
