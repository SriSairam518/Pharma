
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    FileText,
    Package,
    TrendingUp,
    Pill,
} from 'lucide-react';

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

            <div className="sidebar__brand">
                <div className="sidebar__logo" aria-hidden="true">
                    <Pill size={22} />
                </div>
                <div>
                    <span className="sidebar__app-name">PharmaMS</span>
                    <span className="sidebar__app-sub">Medical Shop</span>
                </div>
            </div>

            <nav>
                <ul className="sidebar__nav" role="list">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <li key={to}>
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