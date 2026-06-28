
import './App.css'
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

const BACKEND_URL = (import.meta.env.VITE_URL).replace('/api', '');

const App = () => {

    useEffect(() => {
        const wakeUpBackend = async () => {
            try {
                await fetch(`${BACKEND_URL}`, { method: 'GET' });
                toast.success("Backend is awake");
            } catch (err) {
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
                <Route path="/login"            element={<LoginPage />} />
                <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
                <Route path="/reset-password"   element={<ResetPasswordPage />} />

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

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;