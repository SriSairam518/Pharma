
import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Building2, FileText, Package, TrendingUp, Pill, ChevronDown,
} from 'lucide-react';

const navItems = [
    { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/agencies',  icon: Building2,       label: 'Agencies'  },
    { to: '/bills',     icon: FileText,        label: 'Bills'     },
    { to: '/inventory', icon: Package,         label: 'Inventory' },
    { to: '/income',    icon: TrendingUp,      label: 'Income'    },
];

const MobileTopBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') setIsOpen(false); };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const currentPage = navItems.find(item =>
        item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
    );

    return (
        <header className="mobile-topbar" ref={dropdownRef}>
            <button
                className="mobile-topbar__trigger"
                onClick={() => setIsOpen(v => !v)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-label="Open navigation menu"
            >
                <div className="mobile-topbar__logo" aria-hidden="true">
                    <Pill size={18} />
                </div>
                <div className="mobile-topbar__title">
                    <span className="mobile-topbar__app-name">PharmaMS</span>
                    {currentPage && (
                        <span className="mobile-topbar__current-page">{currentPage.label}</span>
                    )}
                </div>
                <ChevronDown
                    size={18}
                    className={`mobile-topbar__chevron ${isOpen ? 'mobile-topbar__chevron--open' : ''}`}
                    aria-hidden="true"
                />
            </button>

            {isOpen && (
                <nav className="mobile-topbar__dropdown" role="navigation" aria-label="Main navigation">
                    <ul role="list">
                        {navItems.map(({ to, icon: Icon, label }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    end={to === '/'}
                                    className={({ isActive }) =>
                                        `mobile-topbar__link ${isActive ? 'mobile-topbar__link--active' : ''}`
                                    }
                                >
                                    <Icon size={18} aria-hidden="true" />
                                    <span>{label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {isOpen && (
                <div
                    className="mobile-topbar__backdrop"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </header>
    );
};

export default MobileTopBar;