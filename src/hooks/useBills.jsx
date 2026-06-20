// ============================================================
// src/hooks/useBills.js
//
// Manages all bill data and operations for one agency.
// Used by AgencyBillsPage.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { billApi } from '../services/api';
import toast from 'react-hot-toast';

const useBills = (agencyId) => {
    const [summary, setSummary]       = useState(null);  // AgencyBillsSummary from backend
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // dateFilter: { type: 'all' | 'days' | 'custom', days: 30, from: '', to: '' }
    const [dateFilter, setDateFilter] = useState({ type: 'all' });

    // Build the query params from the current filter state
    const buildParams = useCallback((filter) => {
        if (filter.type === 'days' && filter.days) return { days: filter.days };
        if (filter.type === 'custom' && filter.from && filter.to)
            return { from: filter.from, to: filter.to };
        return {};  // 'all' — no params → backend returns everything
    }, []);

    const fetchBills = useCallback(async (filter = dateFilter) => {
        if (!agencyId) return;
        setLoading(true);
        setError(null);
        try {
            const params = buildParams(filter);
            const response = await billApi.getByAgency(agencyId, params);
            // Unwrap: axios → ApiResponse → actual data
            setSummary(response.data.data);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to load bills';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [agencyId, dateFilter, buildParams]);

    // Fetch whenever agencyId or dateFilter changes
    useEffect(() => {
        fetchBills(dateFilter);
    }, [agencyId, dateFilter]);  // eslint-disable-line

    const applyFilter = (newFilter) => {
        setDateFilter(newFilter);
        // fetchBills will be called automatically via useEffect above
    };

    const deleteBill = async (id, billNumber) => {
        try {
            await billApi.delete(id);
            // Remove from list without refetching
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

    // Called after a payment is recorded — refreshes the specific bill
    // in the list without refetching everything
    const updateBillInList = (billId, newDueAmount, newStatus) => {
        setSummary(prev => {
            if (!prev) return prev;
            const updatedBills = prev.bills.map(b =>
                b.id === billId
                    ? { ...b, dueAmount: newDueAmount, status: newStatus,
                        paidAmount: b.totalAmount - newDueAmount }
                    : b
            );
            // Recalculate summary totals
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