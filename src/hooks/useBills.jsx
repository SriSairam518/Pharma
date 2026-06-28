
import { useState, useEffect, useCallback } from 'react';
import { billApi } from '../services/api';
import toast from 'react-hot-toast';

const useBills = (agencyId) => {
    const [summary, setSummary]       = useState(null);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [dateFilter, setDateFilter] = useState({ type: 'all' });

    const buildParams = useCallback((filter) => {
        if (filter.type === 'days' && filter.days) return { days: filter.days };
        if (filter.type === 'custom' && filter.from && filter.to)
            return { from: filter.from, to: filter.to };
        return {};
    }, []);

    const fetchBills = useCallback(async (filter = dateFilter) => {
        if (!agencyId) return;
        setLoading(true);
        setError(null);
        try {
            const params = buildParams(filter);
            const response = await billApi.getByAgency(agencyId, params);
            setSummary(response.data.data);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load bills';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [agencyId, dateFilter, buildParams]);

    useEffect(() => {
        fetchBills(dateFilter);
    }, [agencyId, dateFilter]);

    const applyFilter = (newFilter) => {
        setDateFilter(newFilter);
    };

    const deleteBill = async (id, billNumber) => {
        try {
            await billApi.delete(id);
            setSummary(prev => ({
                ...prev,
                bills: prev.bills.filter(b => b.id !== id),
                billCount: prev.billCount - 1,
            }));
            toast.success(`Bill "${billNumber}" deleted`);
            return { success: true };
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete bill');
            return { success: false };
        }
    };

    const updateBillInList = (billId, newDueAmount, newStatus) => {
        setSummary(prev => {
            if (!prev) return prev;
            const updatedBills = prev.bills.map(b =>
                b.id === billId
                    ? { ...b, dueAmount: newDueAmount, status: newStatus,
                        paidAmount: b.totalAmount - newDueAmount }
                    : b
            );
            const totalDue  = updatedBills.reduce((s, b) => s + Number(b.dueAmount), 0);
            const totalPaid = updatedBills.reduce((s, b) => s + Number(b.paidAmount), 0);
            return { ...prev, bills: updatedBills,
                totalDueAmount: totalDue, totalPaidAmount: totalPaid };
        });
    };

    return {
        summary,
        loading,
        error,
        submitting,
        dateFilter,
        applyFilter,
        fetchBills,
        deleteBill,
        updateBillInList,
    };
};

export default useBills;