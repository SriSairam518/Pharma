import axios from 'axios';

const BASE_URL = import.meta.env.VITE_URL;

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('pharma_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isAuthEndpoint = error.config?.url?.includes('/auth/');
            if (!isAuthEndpoint) {
                localStorage.removeItem('pharma_token');
                localStorage.removeItem('pharma_user');
                window.location.href = '/login';
            }
        }
        if (!error.response) {
            error.message = 'Cannot connect to server. Please check your connection.';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login:          (data)  => apiClient.post('/auth/login', data),
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword:  (data)  => apiClient.post('/auth/reset-password', data),
};

export const agencyApi = {
    getAll:  ()           => apiClient.get('/agencies'),
    getById: (id)         => apiClient.get(`/agencies/${id}`),
    create:  (data)       => apiClient.post('/agencies', data),
    update:  (id, data)   => apiClient.put(`/agencies/${id}`, data),
    delete:  (id)         => apiClient.delete(`/agencies/${id}`),
};

export const billApi = {
    getByAgency: (agencyId, params = {}) => apiClient.get(`/agencies/${agencyId}/bills`, { params }),
    getById:     (id)         => apiClient.get(`/bills/${id}`),
    create:      (data)       => apiClient.post('/bills', data),
    update:      (id, data)   => apiClient.put(`/bills/${id}`, data),
    delete:      (id)         => apiClient.delete(`/bills/${id}`),
};

export const paymentApi = {
    pay:        (billId, data) => apiClient.post(`/bills/${billId}/payments`, data),
    getHistory: (billId)       => apiClient.get(`/bills/${billId}/payments`),
};

export const uploadApi = {
    uploadBillImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/uploads/bill', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    uploadPaymentProof: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/uploads/payment', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
};

export const ocrApi = {
    scan: (imageUrl) => apiClient.post('/ocr/scan', { imageUrl }, { timeout: 120000 }),
};

export default apiClient;