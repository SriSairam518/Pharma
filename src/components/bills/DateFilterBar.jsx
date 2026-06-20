// ============================================================
// src/components/bills/DateFilterBar.jsx
//
// Date range filter bar with quick buttons + custom range.
// ============================================================

import { useState } from 'react';
import Button from '../common/Button';

const QUICK_OPTIONS = [
    { label: 'All',     type: 'all'  },
    { label: 'Last 7d', type: 'days', days: 7   },
    { label: 'Last 30d',type: 'days', days: 30  },
    { label: 'Last 60d',type: 'days', days: 60  },
];

const DateFilterBar = ({ currentFilter, onApply }) => {
    // Local state for the custom date inputs
    const [from, setFrom] = useState('');
    const [to,   setTo]   = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const handleQuickClick = (option) => {
        setShowCustom(false);
        onApply(option);
    };

    const handleCustomApply = () => {
        if (!from || !to) return;
        onApply({ type: 'custom', from, to });
    };

    // Check if a quick button is active
    const isActive = (option) => {
        if (option.type === 'all'  && currentFilter.type === 'all')  return true;
        if (option.type === 'days' && currentFilter.type === 'days'
            && currentFilter.days === option.days) return true;
        return false;
    };

    return (
        <div className="date-filter-bar">
            <div className="date-filter-bar__quick">
                {QUICK_OPTIONS.map((opt) => (
                    <button
                        key={opt.label}
                        className={`filter-chip ${isActive(opt) ? 'filter-chip--active' : ''}`}
                        onClick={() => handleQuickClick(opt)}
                        aria-pressed={isActive(opt)}
                    >
                        {opt.label}
                    </button>
                ))}

                {/* Custom range toggle */}
                <button
                    className={`filter-chip ${currentFilter.type === 'custom' ? 'filter-chip--active' : ''}`}
                    onClick={() => setShowCustom(v => !v)}
                    aria-expanded={showCustom}
                >
                    Custom
                </button>
            </div>

            {/* Custom date range inputs — shown when "Custom" is clicked */}
            {showCustom && (
                <div className="date-filter-bar__custom">
                    <label className="form-label" htmlFor="from-date">From</label>
                    <input
                        id="from-date"
                        type="date"
                        className="form-input date-input"
                        value={from}
                        onChange={e => setFrom(e.target.value)}
                        max={to || undefined}
                    />
                    <label className="form-label" htmlFor="to-date">To</label>
                    <input
                        id="to-date"
                        type="date"
                        className="form-input date-input"
                        value={to}
                        onChange={e => setTo(e.target.value)}
                        min={from || undefined}
                    />
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCustomApply}
                        disabled={!from || !to}
                    >
                        Apply
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DateFilterBar;