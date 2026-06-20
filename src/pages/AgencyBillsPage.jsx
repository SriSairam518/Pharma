// ============================================================
// src/pages/AgencyBillsPage.jsx
//
// Opens when user clicks an agency card.
// Shows: agency name, summary totals, date filter bar,
//        list of bills, pay modal, bill detail modal.
// ============================================================

// ============================================================
// src/pages/AgencyBillsPage.jsx
//
// Opens when user clicks an agency card.
// Shows: agency name, summary totals, date filter bar,
//        list of bills, pay modal, bill detail modal.
// ============================================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, RefreshCw, Receipt } from 'lucide-react';
import useBills from '../hooks/useBills';
import BillCard from '../components/bills/BillCard';
import SummaryBar from '../components/bills/SummaryBar';
import DateFilterBar from '../components/bills/DateFilterBar';
import PaymentModal from '../components/bills/PaymentModal';
import BillDetailModal from '../components/bills/BillDetailModal';
import ConfirmDialog from '../components/common/Confirmdialog.jsx';
import Button from '../components/common/Button';

const AgencyBillsPage = () => {
    const { agencyId }  = useParams();   // from URL: /agencies/:agencyId/bills
    const navigate      = useNavigate();

    const {
        summary, loading, error, dateFilter,
        applyFilter, fetchBills, deleteBill, updateBillInList,
    } = useBills(agencyId);

    // ---- UI state ----
    const [payingBill,    setPayingBill]    = useState(null); // bill selected for payment
    const [viewingBillId, setViewingBillId] = useState(null); // bill id for detail view
    const [deletingBill,  setDeletingBill]  = useState(null); // bill selected for delete
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ---- Handlers ----
    const handlePaySuccess = () => {
        // Full refetch — guarantees every number on screen matches the DB.
        // This is the safest approach after a discount payment.
        fetchBills(dateFilter);
        setPayingBill(null);
    };

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        const result = await deleteBill(deletingBill.id, deletingBill.billNumber);
        setDeleteLoading(false);
        if (result.success) setDeletingBill(null);
    };

    // Navigate to the upload/create bill page
    const handleAddBill = () => {
        navigate(`/agencies/${agencyId}/bills/new`);
    };

    const agencyName = summary?.agencyName || 'Agency';
    const bills      = summary?.bills || [];

    return (
        <div className="page">

            {/* ---- Page Header ---- */}
            <div className="page-header">
                <div className="page-header__left">
                    {/* Back arrow → goes back to agencies list */}
                    <button
                        className="back-btn"
                        onClick={() => navigate('/agencies')}
                        aria-label="Back to agencies"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">{agencyName}</h1>
                        <p className="page-subtitle">
                            {summary ? `${summary.billCount} bill${summary.billCount !== 1 ? 's' : ''}` : 'Bills'}
                        </p>
                    </div>
                </div>

                <div className="page-header__actions">
                    <Button variant="ghost" size="sm" onClick={() => fetchBills()} loading={loading}
                            aria-label="Refresh" title="Refresh">
                        <RefreshCw size={16} />
                    </Button>
                    <Button variant="primary" onClick={handleAddBill}>
                        <Plus size={18} aria-hidden="true" />
                        Add bill
                    </Button>
                </div>
            </div>

            {/* ---- Summary totals bar ---- */}
            <SummaryBar summary={summary} />

            {/* ---- Date filter bar ---- */}
            <DateFilterBar currentFilter={dateFilter} onApply={applyFilter} />

            {/* ---- Main content ---- */}
            <div className="page-content">

                {/* LOADING — skeleton cards */}
                {loading && bills.length === 0 && (
                    <div className="loading-grid">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="skeleton-card" aria-hidden="true">
                                <div className="skeleton skeleton--title" />
                                <div className="skeleton skeleton--text" />
                                <div className="skeleton skeleton--text skeleton--short" />
                            </div>
                        ))}
                    </div>
                )}

                {/* ERROR */}
                {error && !loading && (
                    <div className="state-container" role="alert">
                        <div className="state-box state-box--error">
                            <p className="state-box__message">{error}</p>
                            <Button variant="secondary" size="sm" onClick={() => fetchBills()}>
                                Try again
                            </Button>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && bills.length === 0 && (
                    <div className="state-container">
                        <div className="empty-state">
                            <div className="empty-state__icon" aria-hidden="true">
                                <Receipt size={40} />
                            </div>
                            <h2 className="empty-state__title">No bills yet</h2>
                            <p className="empty-state__description">
                                Scan or add a bill from {agencyName} to get started.
                            </p>
                            <Button variant="primary" onClick={handleAddBill}>
                                <Plus size={18} aria-hidden="true" />
                                Add first bill
                            </Button>
                        </div>
                    </div>
                )}

                {/* BILLS LIST */}
                {bills.length > 0 && (
                    <div className="bill-list" role="list" aria-label="Bills list">
                        {bills.map(bill => (
                            <div key={bill.id} role="listitem">
                                <BillCard
                                    bill={bill}
                                    onPay={setPayingBill}
                                    onView={b => setViewingBillId(b.id)}
                                    onDelete={setDeletingBill}
                                />
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* ---- PAYMENT MODAL ---- */}
            <PaymentModal
                isOpen={!!payingBill}
                onClose={() => setPayingBill(null)}
                bill={payingBill}
                onPaymentSuccess={handlePaySuccess}
            />

            {/* ---- BILL DETAIL MODAL ---- */}
            <BillDetailModal
                isOpen={!!viewingBillId}
                onClose={() => setViewingBillId(null)}
                billId={viewingBillId}
            />

            {/* ---- DELETE CONFIRM ---- */}
            <ConfirmDialog
                isOpen={!!deletingBill}
                onClose={() => setDeletingBill(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete bill?"
                message={`Delete bill "#${deletingBill?.billNumber}"? This will also remove all its medicine items and payment records. This cannot be undone.`}
                confirmLabel="Yes, delete"
                isLoading={deleteLoading}
            />

        </div>
    );
};

export default AgencyBillsPage;