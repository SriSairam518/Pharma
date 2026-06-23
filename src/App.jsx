// src/App.jsx — with auth routes, protected routes, and backend wake-up ping
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import AppLayout       from './components/common/AppLayout';
import ProtectedRoute  from './components/common/ProtectedRoute';
import LoginPage       from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import AgenciesPage    from './pages/AgenciesPage.jsx';
import AgencyBillsPage from './pages/AgencyBillsPage';
import UploadBillPage  from './pages/UploadBillPage';
import toast from 'react-hot-toast';

const DashboardPage = () => <div className="page"><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Coming soon</p></div>;
const InventoryPage = () => <div className="page"><h1 className="page-title">Inventory</h1><p className="page-subtitle">Coming soon</p></div>;
const IncomePage    = () => <div className="page"><h1 className="page-title">Income</h1><p className="page-subtitle">Coming soon</p></div>;

const BACKEND_URL = import.meta.env.VITE_URL;

const App = () => {

    // ================================================================
    // BACKEND WAKE-UP PING
    // Render's free tier sleeps after 15 minutes of inactivity.
    // When the frontend first loads, we immediately ping the /health
    // endpoint — this wakes the backend up so it's ready by the time
    // the user logs in and starts making real API calls.
    // Without this, the first login attempt after idle could time out.
    // ================================================================
    useEffect(() => {
        const wakeUpBackend = async () => {
            try {
                await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
                toast.success("Backend is awake");
            } catch (err) {
                // Silently ignore — the backend might still be waking up
                // It will be ready by the time the user logs in
                toast.error("Backend not started " + err);
            }
        };
        wakeUpBackend();
    }, []);

    return (
        <BrowserRouter>
            <Toaster position="top-right" toastOptions={{
                duration: 3500,
                style: { fontFamily: 'Outfit, sans-serif', fontSize: '14px', borderRadius: '10px' },
                success: { iconTheme: { primary: '#1a7a5e', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#c0152f', secondary: '#fff' } },
            }} />

            <Routes>
                {/* ---- PUBLIC ROUTES (no login needed) ---- */}
                <Route path="/login"            element={<LoginPage />} />
                <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
                <Route path="/reset-password"   element={<ResetPasswordPage />} />

                {/* ---- PROTECTED ROUTES (require login) ---- */}
                <Route element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/"                             element={<DashboardPage />} />
                    <Route path="/agencies"                     element={<AgenciesPage />} />
                    <Route path="/agencies/:agencyId/bills"     element={<AgencyBillsPage />} />
                    <Route path="/agencies/:agencyId/bills/new" element={<UploadBillPage />} />
                    <Route path="/inventory"                    element={<InventoryPage />} />
                    <Route path="/income"                       element={<IncomePage />} />
                </Route>

                {/* Catch-all → home (which redirects to login if not authenticated) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;