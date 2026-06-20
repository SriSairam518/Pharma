// ============================================================
// src/hooks/usePayment.js
//
// Handles recording a payment against a bill.
// Used by the PaymentModal.
// ============================================================

// src/hooks/usePayment.js
// Handles recording a payment. After success, triggers a full
// bills refetch so every number on screen is guaranteed correct.

// src/hooks/usePayment.js
// Handles recording a payment, including the new payment date
// and one-click "mark as fully paid" path.

import { useState } from 'react';
import { paymentApi, uploadApi } from '../services/api';
import toast from 'react-hot-toast';

const usePayment = (onSuccess) => {
    const [submitting,     setSubmitting]     = useState(false);
    const [uploadingProof, setUploadingProof] = useState(false);
    const [proofUrl,       setProofUrl]       = useState('');

    const uploadProof = async (file) => {
        setUploadingProof(true);
        try {
            const response = await uploadApi.uploadPaymentProof(file);
            const url = response.data.data.url;
            setProofUrl(url);
            toast.success('Proof uploaded');
            return url;
        } catch {
            toast.error('Failed to upload proof image');
            return null;
        } finally {
            setUploadingProof(false);
        }
    };

    // formData can include: amountPaid, paymentDate, discountType,
    // discountValue, notes, markAsFullyPaid (boolean)
    const submitPayment = async (billId, formData) => {
        setSubmitting(true);
        try {
            const payload = {
                amountPaid:      formData.amountPaid != null ? parseFloat(formData.amountPaid) : null,
                paymentDate:     formData.paymentDate || new Date().toISOString().split('T')[0],
                discountType:    formData.discountType  || null,
                discountValue:   formData.discountValue ? parseFloat(formData.discountValue) : null,
                proofImageUrl:   proofUrl || null,
                notes:           formData.notes || null,
                markAsFullyPaid: !!formData.markAsFullyPaid,
            };

            const response = await paymentApi.pay(billId, payload);
            const result    = response.data.data;

            toast.success(
                formData.markAsFullyPaid
                    ? 'Bill marked as fully paid!'
                    : 'Payment recorded successfully!'
            );
            setProofUrl('');

            if (onSuccess) onSuccess(billId, result.newDueAmount, result.billStatus);

            return { success: true };
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to record payment';
            toast.error(message);
            return { success: false, error: message };
        } finally {
            setSubmitting(false);
        }
    };

    return { submitting, uploadingProof, proofUrl, uploadProof, submitPayment };
};

export default usePayment;