// ============================================================
// src/components/common/AppLayout.jsx
//
// The shell that wraps every page.
// Renders BOTH Sidebar and MobileTopBar — CSS media queries
// decide which one is actually visible at any given screen size.
// This is simpler than conditionally rendering based on JS window
// width (which causes a flash on load / resize) — CSS handles it
// instantly with zero JavaScript.
// ============================================================

import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar.jsx';
import MobileTopBar from './MobileTopBar';

const AppLayout = () => {
    return (
        <div className="app-layout">
            {/* Visible on desktop/tablet, hidden on mobile via CSS */}
            <Sidebar />

            {/* Visible on mobile only, hidden on desktop via CSS */}
            <MobileTopBar />

            <main className="app-main" id="main-content" tabIndex={-1}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;