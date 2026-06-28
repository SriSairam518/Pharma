
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
    const { agencyId }  = useParams();
    const navigate      = useNavigate();

    const {
        summary, loading, error, dateFilter,
        applyFilter, fetchBills, deleteBill, updateBillInList,
    } = useBills(agencyId);

    const [payingBill,    setPayingBill]    = useState(null);
    const [viewingBillId, setViewingBillId] = useState(null);
    const [deletingBill,  setDeletingBill]  = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handlePaySuccess = () => {
        fetchBills(dateFilter);
        setPayingBill(null);
    };

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        const result = await deleteBill(deletingBill.id, deletingBill.billNumber);
        setDeleteLoading(false);
        if (result.success) setDeletingBill(null);
    };

    const handleAddBill = () => {
        navigate(`/agencies/${agencyId}/bills/new`);
    };

    const agencyName = summary?.agencyName || 'Agency';
    const bills      = summary?.bills || [];

    return (
        <div className="page">

            <div className="page-header">
                <div className="page-header__left">
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

            <SummaryBar summary={summary} />

            <DateFilterBar currentFilter={dateFilter} onApply={applyFilter} />

            <div className="page-content">

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

            <PaymentModal
                isOpen={!!payingBill}
                onClose={() => setPayingBill(null)}
                bill={payingBill}
                onPaymentSuccess={handlePaySuccess}
            />

            <BillDetailModal
                isOpen={!!viewingBillId}
                onClose={() => setViewingBillId(null)}
                billId={viewingBillId}
            />

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