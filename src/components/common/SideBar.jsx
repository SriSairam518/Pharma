// ============================================================
// src/components/common/Sidebar.jsx
//
// The left sidebar navigation.
// Uses react-router-dom's NavLink which automatically adds
// an "active" class to the current page's link.
// ============================================================

import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Package,
    TrendingUp,
    Pill,
} from 'lucide-react';

// Define navigation items in a data array.
// Adding a new page = just add one object here.
const navItems = [
    { to: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/agencies',   icon: Building2,       label: 'Agencies'   },
    { to: '/bills',      icon: FileText,        label: 'Bills'      },
    { to: '/inventory',  icon: Package,         label: 'Inventory'  },
    { to: '/income',     icon: TrendingUp,      label: 'Income'     },
];

const Sidebar = () => {
    return (
        <aside className="sidebar" role="navigation" aria-label="Main navigation">

            {/* App Logo / Brand */}
            <div className="sidebar__brand">
                <div className="sidebar__logo" aria-hidden="true">
                    <Pill size={22} />
                </div>
                <div>
                    <span className="sidebar__app-name">PharmaMS</span>
                    <span className="sidebar__app-sub">Medical Shop</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav>
                <ul className="sidebar__nav" role="list">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <li key={to}>
                            {/*
                NavLink automatically adds className "active"
                when the current URL matches this link's `to`.
                `end` prop on "/" means it only matches exactly "/",
                not every route (since every route starts with /)
              */}
                            <NavLink
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) =>
                                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                                }
                                aria-current={({ isActive }) => isActive ? 'page' : undefined}
                            >
                                <Icon size={18} aria-hidden="true" />
                                <span>{label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

        </aside>
    );
};

export default Sidebar;