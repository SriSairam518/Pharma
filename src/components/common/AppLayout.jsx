
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar.jsx';
import MobileTopBar from './MobileTopBar';

const AppLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />

            <MobileTopBar />

            <main className="app-main" id="main-content" tabIndex={-1}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;