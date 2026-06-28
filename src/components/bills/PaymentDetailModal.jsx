
import { useState } from 'react';
import { Calendar, IndianRupee, Percent, FileText, Image as ImageIcon, ExternalLink, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import ImageViewer from '../common/ImageViewer';

const BASE = import.meta.env.VITE_URL;

const fmt = (v) => {
    if (v === null || v === undefined || v === '') return '—';
    return '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtDateTime = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
};

const PaymentDetailModal = ({ isOpen, onClose, payment, billNumber }) => {
    const [viewerOpen, setViewerOpen] = useState(false);

    if (!payment) return null;

    const hasDiscount = Number(payment.discountAmount) > 0;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Payment detail" size="sm">
                <div className="payment-detail">

                    <div className="payment-detail__hero">
                        <p className="payment-detail__hero-label">Total cleared</p>
                        <p className="payment-detail__hero-amount">{fmt(payment.totalCleared)}</p>
                        {billNumber && <p className="payment-detail__hero-bill">Bill #{billNumber}</p>}
                    </div>

                    <div className="payment-detail__rows">
                        <div className="payment-detail__row">
                            <span><IndianRupee size={14} aria-hidden="true" /> Cash / UPI paid</span>
                            <strong>{fmt(payment.amountPaid)}</strong>
                        </div>

                        {hasDiscount && (
                            <div className="payment-detail__row">
                                <span><Percent size={14} aria-hidden="true" /> Discount applied</span>
                                <strong className="text-success">
                                    {fmt(payment.discountAmount)}
                                    {payment.discountType === 'PERCENTAGE' && ` (${payment.discountValue}%)`}
                                    {payment.discountType === 'FIXED' && ' (fixed)'}
                                </strong>
                            </div>
                        )}

                        <div className="payment-detail__row">
                            <span><Calendar size={14} aria-hidden="true" /> Payment date</span>
                            <strong>{fmtDate(payment.paymentDate)}</strong>
                        </div>

                        <div className="payment-detail__row">
                            <span><Clock size={14} aria-hidden="true" /> Recorded at</span>
                            <strong className="text-muted" style={{ fontSize: 12 }}>{fmtDateTime(payment.paidAt)}</strong>
                        </div>

                        {payment.notes && (
                            <div className="payment-detail__row payment-detail__row--note">
                                <span><FileText size={14} aria-hidden="true" /> Note</span>
                                <span>{payment.notes}</span>
                            </div>
                        )}
                    </div>

                    {payment.proofImageUrl ? (
                        <div className="payment-detail__proof">
                            <p className="payment-detail__proof-label">Payment proof</p>
                            <div className="payment-detail__proof-actions">
                                <button
                                    className="image-thumb-btn"
                                    onClick={() => setViewerOpen(true)}
                                    aria-label="View payment proof"
                                >
                                    <ImageIcon size={14} /> View receipt
                                </button>
                                <a
                                    href={payment.proofImageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="image-thumb-btn"
                                    aria-label="Open proof in new tab"
                                >
                                    <ExternalLink size={13} /> New tab
                                </a>
                            </div>
                        </div>
                    ) : (
                        <p className="payment-detail__no-proof">No payment proof was uploaded for this payment.</p>
                    )}

                </div>
            </Modal>

            {payment.proofImageUrl && (
                <ImageViewer
                    isOpen={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    imageUrl={payment.proofImageUrl}
                    title={`Payment proof — ${fmtDate(payment.paymentDate)}`}
                />
            )}
        </>
    );
};

export default PaymentDetailModal;