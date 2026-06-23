// src/components/common/ProtectedRoute.jsx
// Wraps any route that requires login.
// If no JWT is in localStorage, redirects to /login.

import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token    = localStorage.getItem('pharma_token');
    const location = useLocation();

    if (!token) {
        // Remember where they were trying to go, so after login
        // we can redirect them there instead of always going to /
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;