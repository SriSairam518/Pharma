
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0.00';
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const SummaryBar = ({ summary }) => {
  if (!summary) return null;

  const stats = [
    {
      label:  'Total billed',
      value:  formatINR(summary.totalBilledAmount),
      icon:   TrendingUp,
      color:  'stat-card--blue',
    },
    {
      label:  'Total paid',
      value:  formatINR(summary.totalPaidAmount),
      icon:   CheckCircle,
      color:  'stat-card--green',
    },
    {
      label:  'Total due',
      value:  formatINR(summary.totalDueAmount),
      icon:   AlertCircle,
      color:  Number(summary.totalDueAmount) > 0 ? 'stat-card--red' : 'stat-card--gray',
    },
  ];

  return (
    <div className="summary-bar" role="region" aria-label="Bills summary">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className={`stat-card ${color}`}>
          <div className="stat-card__icon" aria-hidden="true">
            <Icon size={20} />
          </div>
          <div className="stat-card__body">
            <p className="stat-card__label">{label}</p>
            <p className="stat-card__value">{value}</p>
          </div>
        </div>
      ))}

      <div className="stat-card stat-card--gray stat-card--count">
        <p className="stat-card__label">Bills</p>
        <p className="stat-card__value">{summary.billCount ?? 0}</p>
      </div>
    </div>
  );
};

export default SummaryBar;