
// ============================================================
// src/services/api.js
//
// WHAT IS THIS?
// This is the "communication layer" between your React app
// and your Spring Boot backend.
//
// WHY KEEP API CALLS HERE?
// If your backend URL changes, you only update ONE file.
// This is called the "Single Responsibility Principle".
//
// Think of it like a phone directory — you look up the number
// here rather than memorizing it in every component.
// ============================================================

import axios from 'axios';

// Base URL of your Spring Boot backend.
// When you run Spring Boot locally it starts on port 8080.
// We use an environment variable so this is easy to change
// for production without editing code.
const BASE_URL = import.meta.env.VITE_URL;

// Create an axios "instance" with shared settings.
// Every API call you make will automatically include these.
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
    // NOTE: this default 15s timeout is fine for normal CRUD calls
    // (agencies, bills, payments) but is NOT enough for OCR scanning,
    // which can take 30-90 seconds depending on image size and how
    // many medicine rows Mistral has to read. OCR calls override this
    // with a longer timeout below (see ocrApi).
    timeout: 15000,
});

// ---- REQUEST INTERCEPTOR ----
// Runs before every request is sent.
// Later you'll add your JWT auth token here.
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add auth token here in Phase: Auth
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- RESPONSE INTERCEPTOR ----
// Runs after every response comes back.
// Handles common errors in one place (e.g. 401 Unauthorized).
apiClient.interceptors.response.use(
  (response) => response,   // success: just pass it through
  (error) => {
    // If server is down or no internet, give a friendly message
    if (!error.response) {
      error.message = 'Cannot connect to server. Please check your backend is running.';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AGENCY API FUNCTIONS
// Each function maps to one REST endpoint in your Spring Boot
// controller. We'll build those endpoints together later.
// ============================================================
export const agencyApi = {
 
  // GET /api/agencies — fetch all agencies
  // Returns: array of agency objects
  getAll: () =>
    apiClient.get('/agencies'),
 
  // GET /api/agencies/:id — fetch one agency by ID
  // Returns: single agency object
  getById: (id) =>
    apiClient.get(`/agencies/${id}`),
 
  // POST /api/agencies — create a new agency
  // agencyData: { name, contactPerson, phone, email, address, gstin }
  create: (agencyData) =>
    apiClient.post('/agencies', agencyData),
 
  // PUT /api/agencies/:id — update an existing agency
  // agencyData: same shape as create
  update: (id, agencyData) =>
    apiClient.put(`/agencies/${id}`, agencyData),
 
  // DELETE /api/agencies/:id — remove an agency
  delete: (id) =>
    apiClient.delete(`/agencies/${id}`),
};


// ---- BILL API ----
export const billApi = {
    // Get all bills for an agency — with optional filters
    // params: { days: 30 } or { from: '2024-01-01', to: '2024-01-31' }
    getByAgency: (agencyId, params = {}) =>
        apiClient.get(`/agencies/${agencyId}/bills`, { params }),

    // Get one bill in full detail (items + payment history)
    getById: (id) =>
        apiClient.get(`/bills/${id}`),

    // Create a new bill with its medicine items
    create: (data) =>
        apiClient.post('/bills', data),

    // Update a bill (fix OCR mistakes)
    update: (id, data) =>
        apiClient.put(`/bills/${id}`, data),

    // Delete a bill
    delete: (id) =>
        apiClient.delete(`/bills/${id}`),
};

// ---- PAYMENT API ----
export const paymentApi = {
    // Record a payment against a bill
    pay: (billId, data) =>
        apiClient.post(`/bills/${billId}/payments`, data),

    // Get full payment history for a bill
    getHistory: (billId) =>
        apiClient.get(`/bills/${billId}/payments`),
};

// ---- FILE UPLOAD API ----
// File uploads use multipart/form-data, not JSON
export const uploadApi = {
    uploadBillImage: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/uploads/bill', formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
    },

    uploadPaymentProof: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/uploads/payment', formData, {
            headers: {'Content-Type': 'multipart/form-data'},
        });
    },
};

// ---- OCR API ----
// Uses a much longer timeout — Mistral vision processing can take
// 30-90 seconds for bills with many medicine rows, especially on
// a slower connection (phone uploads). The default 15s timeout
// would cancel the request before Mistral even responds.
export const ocrApi = {
    scan: (imageUrl) =>
        apiClient.post('/ocr/scan', { imageUrl }, { timeout: 120000 }), // 2 minutes
};

export default apiClient;
