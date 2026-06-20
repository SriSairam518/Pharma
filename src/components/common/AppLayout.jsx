// ============================================================
// src/components/common/AppLayout.jsx
//
// The shell that wraps every page: sidebar + main content.
// Using a layout component means you don't have to add
// the sidebar to every single page manually.
// ============================================================

import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar.jsx';

const AppLayout = () => {
    return (
        // The outer container uses CSS Grid to place sidebar + content side by side
        <div className="app-layout">
            <Sidebar />
            {/* Outlet renders whichever page the current URL matches */}
            <main className="app-main" id="main-content" tabIndex={-1}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;