
import { useState, useEffect } from 'react';
import { Package, CreditCard, Calendar, Hash, Image as ImageIcon, ExternalLink } from 'lucide-react';
import Modal from '../common/Modal';
import ImageViewer from '../common/ImageViewer';
import PaymentDetailModal from './PaymentDetailModal';
import BillStatusBadge from './BillStatusBadge';
import { billApi } from '../../services/api';

const fmt = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    return '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const BillDetailModal = ({ isOpen, onClose, billId }) => {
    const [bill,        setBill]        = useState(null);
    const [loading,     setLoading]     = useState(false);
    const [viewerUrl,   setViewerUrl]   = useState('');
    const [viewerTitle, setViewerTitle] = useState('');
    const [viewerOpen,  setViewerOpen]  = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        if (!isOpen || !billId) return;
        setLoading(true);
        billApi.getById(billId)
            .then(res => setBill(res.data.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isOpen, billId]);

    const openImage = (url, title) => {
        setViewerUrl(url);
        setViewerTitle(title);
        setViewerOpen(true);
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Bill detail" size="lg">

                {loading && (
                    <div className="detail-loading">
                        {[1,2,3].map(n => <div key={n} className="skeleton skeleton--text" style={{marginBottom:10}}/>)}
                    </div>
                )}

                {bill && !loading && (
                    <div className="bill-detail">

                        <div className="bill-detail__header">
                            <div className="bill-detail__meta">
                                <div className="bill-detail__meta-item">
                                    <Hash size={14} aria-hidden="true" /><span>Bill #{bill.billNumber}</span>
                                </div>
                                <div className="bill-detail__meta-item">
                                    <Calendar size={14} aria-hidden="true" /><span>{fmtDate(bill.billDate)}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BillStatusBadge status={bill.status} />
                                {bill.billImageUrl && (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="image-thumb-btn"
                                                onClick={() => openImage(bill.billImageUrl, `Bill #${bill.billNumber}`)}
                                                title="View bill image" aria-label="View bill scan">
                                            <ImageIcon size={14} /> View scan
                                        </button>
                                        <a href={bill.billImageUrl} target="_blank" rel="noreferrer"
                                           className="image-thumb-btn" title="Open in new tab" aria-label="Open bill image in new tab">
                                            <ExternalLink size={13} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bill-summary-readonly">
                            <div className="bill-summary-readonly__item">
                                <span>Sub total</span><strong>{fmt(bill.subTotal)}</strong>
                            </div>
                            <div className="bill-summary-readonly__item">
                                <span>Discount</span><strong className="text-success">{fmt(bill.billDiscount)}</strong>
                            </div>
                            <div className="bill-summary-readonly__item">
                                <span>GST</span><strong>{fmt(bill.billGst)}</strong>
                            </div>
                            <div className="bill-summary-readonly__item bill-summary-readonly__item--net">
                                <span>Net amount</span><strong>{fmt(bill.netAmount)}</strong>
                            </div>
                        </div>

                        <div className="bill-detail__amounts">
                            <div className="bill-detail__amount">
                                <span>Total</span><strong>{fmt(bill.totalAmount)}</strong>
                            </div>
                            <div className="bill-detail__amount">
                                <span>Paid</span><strong className="text-success">{fmt(bill.paidAmount)}</strong>
                            </div>
                            <div className="bill-detail__amount">
                                <span>Due</span>
                                <strong className={Number(bill.dueAmount) > 0 ? 'text-danger' : ''}>{fmt(bill.dueAmount)}</strong>
                            </div>
                        </div>

                        <div className="bill-detail__section">
                            <h4 className="bill-detail__section-title">
                                <Package size={15} aria-hidden="true" /> Medicine items ({bill.items?.length ?? 0})
                            </h4>
                            {bill.items?.length > 0 ? (
                                <div className="bill-table-wrap">
                                    <table className="bill-table pharma-table" aria-label="Medicine items">
                                        <thead>
                                        <tr>
                                            <th>#</th><th>HSN</th><th>Medicine</th><th>Pack</th><th>Batch</th>
                                            <th>Expiry</th><th>Qty</th><th>MRP</th><th>Rate</th>
                                            <th>Disc</th><th>GST</th><th>Amount</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {bill.items.map((item, idx) => (
                                            <tr key={item.id}>
                                                <td className="text-muted">{idx + 1}</td>
                                                <td className="text-mono">{item.hsnCode || '—'}</td>
                                                <td className="bill-table__medicine">{item.medicineName}</td>
                                                <td>{item.pack || '—'}</td>
                                                <td className="text-mono">{item.batchNumber || '—'}</td>
                                                <td>{item.expiryDate ? fmtDate(item.expiryDate) : '—'}</td>
                                                <td>{item.quantity ?? '—'}</td>
                                                <td>{fmt(item.mrp)}</td>
                                                <td>{fmt(item.rate)}</td>
                                                <td>{item.discount || '—'}</td>
                                                <td>{item.gst || '—'}</td>
                                                <td className="bill-table__total">{fmt(item.amount)}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-muted">No items recorded.</p>
                            )}
                        </div>

                        {bill.payments?.length > 0 && (
                            <div className="bill-detail__section">
                                <h4 className="bill-detail__section-title">
                                    <CreditCard size={15} aria-hidden="true" /> Payment history ({bill.payments.length})
                                </h4>
                                <div className="payment-history">
                                    {bill.payments.map((p) => (
                                        <button
                                            key={p.id}
                                            className="payment-history__item payment-history__item--clickable"
                                            onClick={() => setSelectedPayment(p)}
                                            aria-label={`View payment detail for ${fmt(p.amountPaid)} on ${fmtDate(p.paymentDate)}`}
                                        >
                                            <div className="payment-history__left">
                                                <p className="payment-history__amount">{fmt(p.amountPaid)}</p>
                                                {p.discountAmount > 0 && (
                                                    <p className="payment-history__discount">
                                                        + {fmt(p.discountAmount)} discount
                                                        {p.discountType === 'PERCENTAGE' && ` (${p.discountValue}%)`}
                                                        {' '}= {fmt(p.totalCleared)} cleared
                                                    </p>
                                                )}
                                                {p.notes && <p className="payment-history__note">{p.notes}</p>}
                                            </div>
                                            <p className="payment-history__date">{fmtDate(p.paymentDate)}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </Modal>

            <ImageViewer isOpen={viewerOpen} onClose={() => setViewerOpen(false)}
                         imageUrl={viewerUrl} title={viewerTitle} />

            <PaymentDetailModal
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                payment={selectedPayment}
                billNumber={bill?.billNumber}
            />
        </>
    );
};

export default BillDetailModal;