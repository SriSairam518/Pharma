import { FileText, Package, Trash2, CreditCard, Eye } from 'lucide-react';
import BillStatusBadge from './BillStatusBadge';
import Button from '../common/Button';

const formatINR = (amount) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return '₹' + Number(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
};

const BillCard = ({ bill, onPay, onView, onDelete }) => {
    const isDue     = bill.status !== 'PAID';
    const isFullDue = bill.status === 'UNPAID';

    return (
        <article className={`bill-card ${bill.status === 'PAID' ? 'bill-card--paid' : ''}`}>

            <div className="bill-card__top">
                <div className="bill-card__identity">
                    <div className="bill-card__icon" aria-hidden="true">
                        <FileText size={16} />
                    </div>
                    <div>
                        <h3 className="bill-card__number">#{bill.billNumber}</h3>
                        <p className="bill-card__date">{formatDate(bill.billDate)}</p>
                    </div>
                </div>
                <BillStatusBadge status={bill.status} />
            </div>

            <div className="bill-card__amounts">
                <div className="bill-card__amount-item">
                    <span className="bill-card__amount-label">Total</span>
                    <span className="bill-card__amount-value">{formatINR(bill.totalAmount)}</span>
                </div>
                <div className="bill-card__amount-item">
                    <span className="bill-card__amount-label">Paid</span>
                    <span className="bill-card__amount-value bill-card__amount-value--paid">
            {formatINR(bill.paidAmount)}
          </span>
                </div>
                <div className="bill-card__amount-item">
                    <span className="bill-card__amount-label">Due</span>
                    <span className={`bill-card__amount-value ${isDue ? 'bill-card__amount-value--due' : ''}`}>
            {formatINR(bill.dueAmount)}
          </span>
                </div>
            </div>

            <div className="bill-card__footer">
                <div className="bill-card__meta">
                    <Package size={13} aria-hidden="true" />
                    <span>{bill.itemCount ?? '—'} item{bill.itemCount !== 1 ? 's' : ''}</span>
                </div>


                <div className="bill-card__actions">

                    <button
                        className="icon-btn icon-btn--edit"
                        onClick={() => onView(bill)}
                        aria-label={`View bill #${bill.billNumber}`}
                        title="View detail"
                    >
                        <Eye size={15} />
                    </button>

                    {isDue && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onPay(bill)}
                            aria-label={`Pay bill #${bill.billNumber}`}
                        >
                            <CreditCard size={14} aria-hidden="true" />
                            Pay
                        </Button>
                    )}

                    <button
                        className="icon-btn icon-btn--delete"
                        onClick={() => onDelete(bill)}
                        aria-label={`Delete bill #${bill.billNumber}`}
                        title="Delete bill"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

        </article>
    );
};

export default BillCard;