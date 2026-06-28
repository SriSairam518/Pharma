
const STATUS_CONFIG = {
    UNPAID:         { label: 'Unpaid',   className: 'badge badge--danger'  },
    PARTIALLY_PAID: { label: 'Partial',  className: 'badge badge--warning' },
    PAID:           { label: 'Paid',     className: 'badge badge--success' },
};

const BillStatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.UNPAID;
    return (
        <span className={config.className} aria-label={`Status: ${config.label}`}>
      {config.label}
    </span>
    );
};

export default BillStatusBadge;