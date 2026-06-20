import './App.css'
// src/App.jsx — updated with bill routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout      from './components/common/AppLayout';
import AgenciesPage   from './pages/AgencyPage.jsx';
import AgencyBillsPage from './pages/AgencyBillsPage';
import UploadBillPage  from './pages/UploadBillPage';

const DashboardPage = () => <div className="page"><h1 className="page-title">Dashboard</h1><p className="page-subtitle">Coming soon — Phase 6</p></div>;
const InventoryPage = () => <div className="page"><h1 className="page-title">Inventory</h1><p className="page-subtitle">Coming soon — Phase 5</p></div>;
const IncomePage    = () => <div className="page"><h1 className="page-title">Income</h1><p className="page-subtitle">Coming soon — Phase 5</p></div>;

const App = () => (
    <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
            duration: 3500,
            style: { fontFamily: 'Outfit, sans-serif', fontSize: '14px', borderRadius: '10px' },
            success: { iconTheme: { primary: '#1a7a5e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#c0152f', secondary: '#fff' } },
        }} />
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/"                                  element={<DashboardPage   />} />
                <Route path="/agencies"                          element={<AgenciesPage    />} />
                <Route path="/agencies/:agencyId/bills"          element={<AgencyBillsPage />} />
                <Route path="/agencies/:agencyId/bills/new"      element={<UploadBillPage  />} />
                <Route path="/inventory"                         element={<InventoryPage   />} />
                <Route path="/income"                            element={<IncomePage      />} />
                <Route path="*"                                  element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    </BrowserRouter>
);

export default App;
