// ============================================================
// src/pages/UploadBillPage.jsx
//
// The 4-step bill creation flow:
//   Step 1 — Upload bill image
//   Step 2 — OCR processes → fills editable table
//   Step 3 — User reviews and edits the table rows
//   Step 4 — Fill bill details (number, date) → Save
//
// NOTE ON OCR:
// Real OCR requires a backend endpoint that calls Tesseract/Google Vision.
// For now, we call POST /api/ocr/scan which returns extracted rows.
// If that endpoint isn't built yet, we fallback to "manual entry" mode
// where the user fills the table themselves.
// ============================================================

// src/pages/UploadBillPage.jsx
// Upload bill image → Mistral OCR → auto-fills table + bill number + date
// Shows warning if calculated total doesn't match bill total

// src/pages/UploadBillPage.jsx
// Real pharma invoice columns, fully scanned (no calculation).
// Columns: HSN | Medicine | Pack | Batch | Expiry | Qty | MRP | Rate | Disc | GST | Amount
// Bill summary: Sub Total | Discount | GST | Net Amount (all scanned)

import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, ArrowLeft, Save, ScanLine } from 'lucide-react';
import { billApi, uploadApi, ocrApi } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.BACKEND_URL;

// Empty row template — all fields blank, user or OCR fills them
const emptyRow = () => ({
    _id:          crypto.randomUUID(),
    hsnCode:      '',
    medicineName: '',
    pack:         '',
    batchNumber:  '',
    expiryDate:   '',
    quantity:     '',
    mrp:          '',
    rate:         '',
    discount:     '',
    gst:          '',
    amount:       '',
});

const fmt = (v) => {
    if (v === '' || v === null || v === undefined || isNaN(v)) return '—';
    return '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const UploadBillPage = () => {
    const { agencyId } = useParams();
    const navigate     = useNavigate();

    const [step,         setStep]         = useState(1);
    const [billImageUrl, setBillImageUrl] = useState('');
    const [rows,         setRows]         = useState([emptyRow()]);

    // Bill header fields
    const [billNumber,   setBillNumber]   = useState('');
    const [billDate,     setBillDate]     = useState('');

    // Bill summary fields — ALL scanned, not calculated
    const [subTotal,     setSubTotal]     = useState('');
    const [billDiscount, setBillDiscount] = useState('');
    const [billGst,      setBillGst]      = useState('');
    const [netAmount,    setNetAmount]    = useState('');

    const [errors,  setErrors]  = useState({});
    const [saving,  setSaving]  = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);

    // ================================================================
    // STEP 1+2 — Upload image, then call OCR
    // ================================================================
    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        let url = '';
        try {
            const uploadRes = await uploadApi.uploadBillImage(file);
            url = uploadRes.data.data.url;
            setBillImageUrl(url);
            toast.success('Image uploaded — scanning now...');
        } catch {
            toast.error('Failed to upload image');
            setUploading(false);
            return;
        }
        setUploading(false);
        setStep(2);

        try {
            const ocrRes  = await ocrApi.scan(url);
            const result  = ocrRes.data.data;

            if (result.billNumber) setBillNumber(result.billNumber);
            if (result.billDate)   setBillDate(result.billDate);
            if (result.subTotal     != null) setSubTotal(String(result.subTotal));
            if (result.billDiscount != null) setBillDiscount(String(result.billDiscount));
            if (result.billGst      != null) setBillGst(String(result.billGst));
            if (result.netAmount    != null) setNetAmount(String(result.netAmount));

            const items = result.items || [];
            if (items.length > 0) {
                setRows(items.map(r => ({
                    _id:          crypto.randomUUID(),
                    hsnCode:      r.hsnCode      || '',
                    medicineName: r.medicineName || '',
                    pack:         r.pack         || '',
                    batchNumber:  r.batchNumber  || '',
                    expiryDate:   r.expiryDate   || '',
                    quantity:     r.quantity     != null ? String(r.quantity) : '',
                    mrp:          r.mrp          != null ? String(r.mrp)      : '',
                    rate:         r.rate         != null ? String(r.rate)     : '',
                    discount:     r.discount     || '',
                    gst:          r.gst          || '',
                    amount:       r.amount       != null ? String(r.amount)   : '',
                })));
                toast.success(
                    `Extracted ${items.length} items` +
                    (result.billNumber ? ` · Bill #${result.billNumber}` : '')
                );

                console.log("scan completed : " + items);
            } else {
                setRows([emptyRow()]);
                toast('No items extracted — please fill manually', { icon: '⚠️' });
            }
        } catch (err) {
            const isTimeout = err.code === 'ECONNABORTED';
            toast.error(isTimeout
                ? 'OCR is taking longer than expected. Try again, or fill manually.'
                : (err.response?.data?.message || 'OCR failed — please fill manually'));
            setRows([emptyRow()]);
        }

        setStep(3);
    };

    // ================================================================
    // TABLE EDITING
    // ================================================================
    const updateRow = (idx, field, value) =>
        setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));

    const addRow = () => setRows(prev => [...prev, emptyRow()]);

    const removeRow = (idx) => {
        if (rows.length === 1) { toast('Must have at least one item', { icon: '⚠️' }); return; }
        setRows(prev => prev.filter((_, i) => i !== idx));
    };

    // ================================================================
    // VALIDATE + SAVE
    // ================================================================
    const validate = () => {
        const e = {};
        if (!billNumber.trim()) e.billNumber = 'Bill number is required';
        if (!billDate)          e.billDate   = 'Bill date is required';
        if (!netAmount || isNaN(netAmount)) e.netAmount = 'Net amount (grand total) is required';

        rows.forEach((r, i) => {
            if (!r.medicineName.trim()) e[`row_${i}_name`] = 'Required';
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) { toast.error('Please fix the errors before saving'); return; }
        setSaving(true);
        try {
            await billApi.create({
                agencyId:     parseInt(agencyId),
                billNumber:   billNumber.trim(),
                billDate,
                billImageUrl: billImageUrl || null,
                subTotal:     subTotal     !== '' ? parseFloat(subTotal)     : null,
                billDiscount: billDiscount !== '' ? parseFloat(billDiscount) : null,
                billGst:      billGst      !== '' ? parseFloat(billGst)      : null,
                netAmount:    parseFloat(netAmount),
                items: rows.map(r => ({
                    hsnCode:      r.hsnCode      || null,
                    medicineName: r.medicineName.trim(),
                    pack:         r.pack         || null,
                    batchNumber:  r.batchNumber  || null,
                    expiryDate:   r.expiryDate   || null,
                    quantity:     r.quantity     !== '' ? parseFloat(r.quantity) : null,
                    mrp:          r.mrp          !== '' ? parseFloat(r.mrp)      : null,
                    rate:         r.rate         !== '' ? parseFloat(r.rate)     : null,
                    discount:     r.discount     || null,
                    gst:          r.gst          || null,
                    amount:       r.amount       !== '' ? parseFloat(r.amount)   : null,
                })),
            });
            toast.success('Bill saved successfully!');
            navigate(`/agencies/${agencyId}/bills`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save bill');
        } finally {
            setSaving(false);
        }
    };

    // ================================================================
    // RENDER
    // ================================================================
    return (
        <div className="page">

            <div className="page-header">
                <div className="page-header__left">
                    <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">Add bill</h1>
                        <p className="page-subtitle">Upload a bill image — OCR will scan all details</p>
                    </div>
                </div>
            </div>

            {/* ---- STEP 1: Upload ---- */}
            {step === 1 && (
                <div className="upload-section">
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf"
                           onChange={handleFileChange} className="sr-only" id="bill-file-input" />
                    <div className="upload-zone"
                         onClick={() => !uploading && fileInputRef.current?.click()}
                         onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                         role="button" tabIndex={0} aria-label="Click to upload bill image">
                        <div className="upload-zone__icon"><Upload size={36} /></div>
                        <p className="upload-zone__title">{uploading ? 'Uploading...' : 'Click to upload bill image'}</p>
                        <p className="upload-zone__hint">Take a photo or choose a file · PNG, JPG, PDF · max 10MB</p>
                    </div>
                </div>
            )}

            {/* ---- STEP 2: Scanning ---- */}
            {step === 2 && (
                <div className="scanning-state">
                    <div className="scanning-state__icon"><ScanLine size={40} /></div>
                    <p className="scanning-state__title">Scanning bill with Mistral AI...</p>
                    <p className="scanning-state__hint">This can take up to a minute for bills with many items — please wait</p>
                    <div className="scanning-state__bar"><div className="scanning-state__progress" /></div>
                </div>
            )}

            {/* ---- STEP 3: Editable table + summary ---- */}
            {step === 3 && (
                <div className="bill-form">

                    {/* Bill header */}
                    <div className="bill-form__meta">
                        <Input label="Bill number" required placeholder="e.g. AE05049"
                               value={billNumber} onChange={e => setBillNumber(e.target.value)}
                               error={errors.billNumber}
                               hint={billNumber ? '✅ Auto-filled by OCR' : 'Not detected — enter manually'} />
                        <Input label="Bill date" required type="date"
                               value={billDate} onChange={e => setBillDate(e.target.value)}
                               error={errors.billDate}
                               hint={billDate ? '✅ Auto-filled by OCR' : 'Not detected — enter manually'} />
                    </div>

                    {billImageUrl && (
                        <div className="uploaded-confirmation">
                            <span>✅ Bill image uploaded</span>
                            <a href={billImageUrl} target="_blank" rel="noreferrer"
                               className="agency-card__link">View image ↗</a>
                        </div>
                    )}

                    {/* Medicine items table */}
                    <div className="bill-form__table-section">
                        <div className="bill-form__table-header">
                            <h3 className="bill-form__table-title">Medicine items ({rows.length})</h3>
                            <Button variant="ghost" size="sm" onClick={addRow}><Plus size={15} /> Add row</Button>
                        </div>

                        <div className="editable-table-wrap">
                            <table className="editable-table pharma-table" aria-label="Medicine items">
                                <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>HSN</th>
                                    <th>Medicine name <span className="form-required">*</span></th>
                                    <th>Pack</th>
                                    <th>Batch</th>
                                    <th>Expiry</th>
                                    <th>Qty</th>
                                    <th>MRP</th>
                                    <th>Rate</th>
                                    <th>Disc</th>
                                    <th>GST</th>
                                    <th>Amount</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={row._id}>
                                        <td className="text-muted">{idx + 1}</td>

                                        <td><input type="text" className="table-input table-input--xs"
                                                   placeholder="—" value={row.hsnCode}
                                                   onChange={e => updateRow(idx, 'hsnCode', e.target.value)}
                                                   aria-label={`HSN row ${idx+1}`} /></td>

                                        <td><input type="text"
                                                   className={`table-input ${errors[`row_${idx}_name`] ? 'form-input--error' : ''}`}
                                                   placeholder="Medicine name" value={row.medicineName}
                                                   onChange={e => updateRow(idx, 'medicineName', e.target.value)}
                                                   aria-label={`Medicine name row ${idx+1}`} /></td>

                                        <td><input type="text" className="table-input table-input--xs"
                                                   placeholder="—" value={row.pack}
                                                   onChange={e => updateRow(idx, 'pack', e.target.value)}
                                                   aria-label={`Pack row ${idx+1}`} /></td>

                                        <td><input type="text" className="table-input table-input--sm"
                                                   placeholder="—" value={row.batchNumber}
                                                   onChange={e => updateRow(idx, 'batchNumber', e.target.value)}
                                                   aria-label={`Batch row ${idx+1}`} /></td>

                                        <td><input type="date" className="table-input table-input--sm"
                                                   value={row.expiryDate}
                                                   onChange={e => updateRow(idx, 'expiryDate', e.target.value)}
                                                   aria-label={`Expiry row ${idx+1}`} /></td>

                                        <td><input type="number" step="0.01" className="table-input table-input--xs"
                                                   placeholder="—" value={row.quantity}
                                                   onChange={e => updateRow(idx, 'quantity', e.target.value)}
                                                   aria-label={`Qty row ${idx+1}`} /></td>

                                        <td><input type="number" step="0.01" className="table-input table-input--xs"
                                                   placeholder="—" value={row.mrp}
                                                   onChange={e => updateRow(idx, 'mrp', e.target.value)}
                                                   aria-label={`MRP row ${idx+1}`} /></td>

                                        <td><input type="number" step="0.01" className="table-input table-input--xs"
                                                   placeholder="—" value={row.rate}
                                                   onChange={e => updateRow(idx, 'rate', e.target.value)}
                                                   aria-label={`Rate row ${idx+1}`} /></td>

                                        <td><input type="text" className="table-input table-input--xs"
                                                   placeholder="—" value={row.discount}
                                                   onChange={e => updateRow(idx, 'discount', e.target.value)}
                                                   aria-label={`Discount row ${idx+1}`} /></td>

                                        <td><input type="text" className="table-input table-input--xs"
                                                   placeholder="—" value={row.gst}
                                                   onChange={e => updateRow(idx, 'gst', e.target.value)}
                                                   aria-label={`GST row ${idx+1}`} /></td>

                                        <td><input type="number" step="0.01" className="table-input table-input--xs"
                                                   placeholder="—" value={row.amount}
                                                   onChange={e => updateRow(idx, 'amount', e.target.value)}
                                                   aria-label={`Amount row ${idx+1}`} /></td>

                                        <td>
                                            <button className="icon-btn icon-btn--delete" onClick={() => removeRow(idx)}
                                                    aria-label={`Remove row ${idx+1}`}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bill summary — sub total, discount, GST, net amount — ALL scanned */}
                    <div className="bill-form__table-section">
                        <div className="bill-form__table-header">
                            <h3 className="bill-form__table-title">Bill summary (scanned from bill)</h3>
                        </div>
                        <div className="bill-summary-grid">
                            <Input label="Sub total / gross amount" type="number" step="0.01"
                                   placeholder="0.00" value={subTotal} onChange={e => setSubTotal(e.target.value)}
                                   hint={subTotal ? '✅ Auto-filled by OCR' : 'Optional'} />
                            <Input label="Discount" type="number" step="0.01"
                                   placeholder="0.00" value={billDiscount} onChange={e => setBillDiscount(e.target.value)}
                                   hint={billDiscount ? '✅ Auto-filled by OCR' : 'Optional'} />
                            <Input label="GST" type="number" step="0.01"
                                   placeholder="0.00" value={billGst} onChange={e => setBillGst(e.target.value)}
                                   hint={billGst ? '✅ Auto-filled by OCR' : 'Optional'} />
                            <Input label="Net amount / grand total" type="number" step="0.01"
                                   required placeholder="0.00" value={netAmount} onChange={e => setNetAmount(e.target.value)}
                                   error={errors.netAmount}
                                   hint={netAmount ? '✅ Auto-filled by OCR' : 'Required — enter the grand total'} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bill-form__actions">
                        <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave} loading={saving}>
                            <Save size={16} /> Save bill
                        </Button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default UploadBillPage;