// ============================================================
// src/components/bills/PaymentModal.jsx
//
// Modal form for paying a bill (partial or full).
// Shows: due amount, input for how much to pay, optional
//        proof image upload, optional note.
// ============================================================

// src/components/bills/PaymentModal.jsx
// Supports: fixed/percentage discount + proof image upload + preview

// src/components/bills/PaymentModal.jsx
// Added: payment date picker + "Mark as fully paid" one-click button
// Discount + proof upload retained from before.

// src/components/bills/PaymentModal.jsx
//
// Reordered flow (top to bottom):
//   1. Payment date
//   2. Discount (optional — fixed ₹ or %)
//   3. Payment proof upload (optional)
//   4. "Mark bill as fully paid" — one click, uses whatever discount/proof
//      was set above. Works with OR without a discount.
//   5. Divider — "or record a partial payment"
//   6. Amount field + notes + Record payment button (manual partial flow)
//
// This way the fully-paid button always reflects the discount and
// receipt you've already set up, instead of sitting above them.

import { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Percent, IndianRupee, X, CheckCheck } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ImageViewer from '../common/ImageViewer';
import usePayment from '../../hooks/usePayment';

const fmt = (v) => '₹' + Number(v || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
});

const today = () => new Date().toISOString().split('T')[0];

const PaymentModal = ({ isOpen, onClose, bill, onPaymentSuccess }) => {
    const [amountPaid,    setAmountPaid]    = useState('');
    const [paymentDate,   setPaymentDate]   = useState(today());
    const [discountType,  setDiscountType]  = useState('NONE');
    const [discountValue, setDiscountValue] = useState('');
    const [notes,         setNotes]         = useState('');
    const [errors,        setErrors]        = useState({});
    const [viewingImage,  setViewingImage]  = useState(false);

    const fileInputRef = useRef(null);
    const { submitting, uploadingProof, proofUrl, uploadProof, submitPayment } = usePayment(onPaymentSuccess);

    useEffect(() => {
        if (isOpen) {
            setAmountPaid('');
            setPaymentDate(today());
            setDiscountType('NONE');
            setDiscountValue('');
            setNotes('');
            setErrors({});
        }
    }, [isOpen]);

    const due = parseFloat(bill?.dueAmount || 0);

    const calcDiscountAmount = () => {
        const val = parseFloat(discountValue);
        if (isNaN(val) || val <= 0) return 0;
        if (discountType === 'FIXED')      return Math.min(val, due);
        if (discountType === 'PERCENTAGE') return (due * Math.min(val, 100)) / 100;
        return 0;
    };

    const discountAmount = calcDiscountAmount();
    const maxPayable      = Math.max(0, due - discountAmount);
    const totalCleared    = (parseFloat(amountPaid) || 0) + discountAmount;
    const remaining        = Math.max(0, due - totalCleared);

    const fillFull = () => {
        setAmountPaid(maxPayable.toFixed(2));
        setErrors(e => ({ ...e, amountPaid: '' }));
    };

    // ---- "Mark as fully paid" ----
    // Works whether or not a discount is set:
    //   - No discount  → entire due becomes the cash amount paid
    //   - With discount → discount is applied first, remaining due becomes cash paid
    // Whatever receipt was uploaded above is attached automatically
    // (usePayment always includes proofUrl from its own state).
    const handleMarkFullyPaid = async () => {
        const e = {};
        if (!paymentDate) e.paymentDate = 'Select a payment date';
        if (discountType !== 'NONE') {
            const dv = parseFloat(discountValue);
            if (isNaN(dv) || dv <= 0) e.discountValue = 'Enter a valid discount value, or switch to "No discount"';
            if (discountType === 'PERCENTAGE' && dv > 100) e.discountValue = 'Percentage cannot exceed 100';
            if (discountType === 'FIXED' && dv > due) e.discountValue = `Fixed discount cannot exceed due ${fmt(due)}`;
        }
        if (Object.keys(e).length > 0) { setErrors(e); return; }

        const result = await submitPayment(bill.id, {
            markAsFullyPaid: true,
            paymentDate,
            discountType:  discountType !== 'NONE' ? discountType  : null,
            discountValue: discountType !== 'NONE' ? discountValue : null,
            notes,
        });
        if (result.success) onClose();
    };

    const validate = () => {
        const e = {};
        const paid = parseFloat(amountPaid);

        if (!paymentDate) e.paymentDate = 'Payment date is required';

        if (discountType === 'NONE' || discountAmount === 0) {
            if (isNaN(paid) || paid <= 0) e.amountPaid = 'Enter a valid amount greater than 0';
        } else {
            if (isNaN(paid) || paid < 0) e.amountPaid = 'Amount paid cannot be negative';
        }

        if (totalCleared > due + 0.01)
            e.amountPaid = `Total (payment + discount) cannot exceed due ${fmt(due)}`;

        if (discountType !== 'NONE') {
            const dv = parseFloat(discountValue);
            if (isNaN(dv) || dv <= 0) e.discountValue = 'Enter a valid discount value';
            if (discountType === 'PERCENTAGE' && dv > 100) e.discountValue = 'Percentage cannot exceed 100';
            if (discountType === 'FIXED' && dv > due) e.discountValue = `Fixed discount cannot exceed due ${fmt(due)}`;
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const result = await submitPayment(bill.id, {
            amountPaid:    parseFloat(amountPaid) || 0,
            paymentDate,
            discountType:  discountType === 'NONE' ? null : discountType,
            discountValue: discountType !== 'NONE' ? parseFloat(discountValue) : null,
            notes,
        });
        if (result.success) onClose();
    };

    const handleProofChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) await uploadProof(file);
    };

    if (!bill) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Record payment" size="md">

                <div className="payment-modal__bill-info">
                    <div className="payment-modal__row">
                        <span>Bill</span><strong>#{bill.billNumber}</strong>
                    </div>
                    <div className="payment-modal__row">
                        <span>Total amount</span><span>{fmt(bill.totalAmount)}</span>
                    </div>
                    <div className="payment-modal__row">
                        <span>Already paid</span><span className="text-success">{fmt(bill.paidAmount)}</span>
                    </div>
                    <div className="payment-modal__row payment-modal__row--due">
                        <span>Current due</span><strong className="text-danger">{fmt(bill.dueAmount)}</strong>
                    </div>
                </div>

                {/* ---- PAYMENT DATE — applies to both flows below ---- */}
                <div className="form-group">
                    <label htmlFor="payment-date" className="form-label">
                        Payment date <span className="form-required">*</span>
                    </label>
                    <input
                        id="payment-date"
                        type="date"
                        className={`form-input ${errors.paymentDate ? 'form-input--error' : ''}`}
                        value={paymentDate}
                        max={today()}
                        onChange={e => { setPaymentDate(e.target.value); setErrors(er => ({...er, paymentDate: ''})); }}
                    />
                    {errors.paymentDate && <p className="form-error" role="alert">{errors.paymentDate}</p>}
                </div>

                {/* ---- DISCOUNT — applies to both flows below ---- */}
                <div className="form-group">
                    <label className="form-label">Discount (optional)</label>
                    <div className="discount-type-row">
                        {['NONE', 'FIXED', 'PERCENTAGE'].map(type => (
                            <button key={type} type="button"
                                    className={`discount-type-btn ${discountType === type ? 'discount-type-btn--active' : ''}`}
                                    onClick={() => { setDiscountType(type); setDiscountValue(''); setErrors({}); }}>
                                {type === 'NONE'       && 'No discount'}
                                {type === 'FIXED'      && <><IndianRupee size={13}/> Fixed amount</>}
                                {type === 'PERCENTAGE' && <><Percent size={13}/> Percentage</>}
                            </button>
                        ))}
                    </div>

                    {discountType !== 'NONE' && (
                        <div className="discount-input-wrap">
                            <span className="amount-prefix">{discountType === 'FIXED' ? '₹' : '%'}</span>
                            <input type="number" step="0.01" min="0"
                                   max={discountType === 'PERCENTAGE' ? 100 : due}
                                   className={`form-input amount-input ${errors.discountValue ? 'form-input--error' : ''}`}
                                   placeholder={discountType === 'PERCENTAGE' ? 'e.g. 5' : 'e.g. 500'}
                                   value={discountValue}
                                   onChange={e => { setDiscountValue(e.target.value); setErrors({}); }} />
                            {discountAmount > 0 && <span className="discount-preview">= {fmt(discountAmount)} off</span>}
                        </div>
                    )}
                    {errors.discountValue && <p className="form-error" role="alert">{errors.discountValue}</p>}
                </div>

                {/* ---- PROOF IMAGE — applies to both flows below ---- */}
                <div className="form-group">
                    <label className="form-label">Payment proof / receipt (optional)</label>
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf"
                           onChange={handleProofChange} className="sr-only" id="proof-upload" />
                    {proofUrl ? (
                        <div className="proof-uploaded">
                            <button type="button" className="proof-thumbnail" onClick={() => setViewingImage(true)}
                                    aria-label="View uploaded proof" title="Click to view">
                                <ImageIcon size={16} aria-hidden="true" /><span>Receipt uploaded — click to view</span>
                            </button>
                            <button type="button" className="icon-btn" onClick={() => fileInputRef.current?.click()}
                                    title="Replace receipt" aria-label="Replace receipt image"><X size={14} /></button>
                        </div>
                    ) : (
                        <button type="button" className="upload-zone upload-zone--sm"
                                onClick={() => fileInputRef.current?.click()} disabled={uploadingProof} aria-busy={uploadingProof}>
                            <Upload size={16} aria-hidden="true" />
                            <span>{uploadingProof ? 'Uploading...' : 'Upload receipt / screenshot'}</span>
                        </button>
                    )}
                </div>

                {/* ---- ONE-CLICK MARK AS FULLY PAID ---- */}
                {/* Now reflects whatever discount + receipt were set above */}
                <button
                    type="button"
                    className="mark-fully-paid-btn"
                    onClick={handleMarkFullyPaid}
                    disabled={submitting}
                >
                    <CheckCheck size={16} aria-hidden="true" />
                    {submitting ? 'Processing...' : `Mark bill as fully paid (${fmt(maxPayable)} cash)`}
                </button>
                <p className="mark-fully-paid-hint">
                    {discountAmount > 0
                        ? `Applies ${fmt(discountAmount)} discount + ${fmt(maxPayable)} cash to fully clear the due`
                        : 'Clears the entire due as a cash/UPI payment'}
                    {proofUrl && ' · receipt above will be attached'}
                </p>

                <div className="divider-with-text"><span>or record a partial payment</span></div>

                <form onSubmit={handleSubmit} noValidate>

                    {/* ---- AMOUNT PAID ---- */}
                    <div className="form-group">
                        <div className="payment-modal__amount-label">
                            <label htmlFor="pay-amount" className="form-label">
                                Amount to pay {discountType === 'NONE' && <span className="form-required">*</span>}
                            </label>
                            <button type="button" className="pay-full-btn" onClick={fillFull}>
                                Pay full {discountAmount > 0 ? `(${fmt(maxPayable)})` : ''}
                            </button>
                        </div>
                        <div className="payment-modal__amount-input-wrap">
                            <span className="amount-prefix">₹</span>
                            <input id="pay-amount" type="number" step="0.01" min="0" max={maxPayable}
                                   className={`form-input amount-input ${errors.amountPaid ? 'form-input--error' : ''}`}
                                   placeholder="0.00" value={amountPaid}
                                   onChange={e => { setAmountPaid(e.target.value); setErrors({}); }}
                                   aria-invalid={!!errors.amountPaid} />
                        </div>
                        {errors.amountPaid && <p className="form-error" role="alert">{errors.amountPaid}</p>}
                    </div>

                    {/* ---- LIVE SUMMARY ---- */}
                    {(parseFloat(amountPaid) > 0 || discountAmount > 0) && (
                        <div className="payment-summary">
                            {discountAmount > 0 && (
                                <div className="payment-summary__row">
                                    <span>Discount</span><span className="text-success">− {fmt(discountAmount)}</span>
                                </div>
                            )}
                            {parseFloat(amountPaid) > 0 && (
                                <div className="payment-summary__row">
                                    <span>Cash / UPI payment</span><span>{fmt(parseFloat(amountPaid) || 0)}</span>
                                </div>
                            )}
                            <div className="payment-summary__row payment-summary__row--total">
                                <span>Total cleared</span><strong>{fmt(totalCleared)}</strong>
                            </div>
                            <div className="payment-summary__row">
                                <span>Remaining due</span>
                                <span className={remaining > 0 ? 'text-danger' : 'text-success'}>{fmt(remaining)}</span>
                            </div>
                        </div>
                    )}

                    {/* ---- NOTES ---- */}
                    <div className="form-group">
                        <label htmlFor="pay-notes" className="form-label">Note (optional)</label>
                        <input id="pay-notes" type="text" className="form-input"
                               placeholder='e.g. "Paid via UPI to Ravi Kumar"' value={notes}
                               onChange={e => setNotes(e.target.value)} maxLength={255} />
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
                        <Button type="submit" variant="primary" loading={submitting}>Record payment</Button>
                    </div>

                </form>
            </Modal>

            {proofUrl && (
                <ImageViewer isOpen={viewingImage} onClose={() => setViewingImage(false)}
                             imageUrl={proofUrl} title="Payment proof" />
            )}
        </>
    );
};

export default PaymentModal;