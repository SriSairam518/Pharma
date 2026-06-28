
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Pill, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../services/api';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const [searchParams]          = useSearchParams();
    const navigate                = useNavigate();
    const token                   = searchParams.get('token');

    const [newPassword,     setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPwd,         setShowPwd]         = useState(false);
    const [loading,         setLoading]         = useState(false);
    const [errors,          setErrors]          = useState({});
    const [done,            setDone]            = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid reset link — please request a new one');
            navigate('/forgot-password', { replace: true });
        }
    }, [token, navigate]);

    const validate = () => {
        const e = {};
        if (!newPassword)                              e.newPassword = 'New password is required';
        else if (newPassword.length < 6)              e.newPassword = 'Password must be at least 6 characters';
        if (newPassword !== confirmPassword)           e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await authApi.resetPassword({ token, newPassword });
            setDone(true);
            toast.success('Password updated successfully!');
        } catch (err) {
            const message = err.response?.data?.message || 'Reset failed — the link may have expired';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-logo">
                    <div className="auth-logo__icon"><Pill size={28} /></div>
                    <div>
                        <h1 className="auth-logo__name">PharmaMS</h1>
                        <p className="auth-logo__sub">Medical Shop Management</p>
                    </div>
                </div>

                {done ? (
                    <div className="auth-success">
                        <div className="auth-success__icon" style={{ color: 'var(--success)' }}>
                            <CheckCircle size={36} />
                        </div>
                        <h2 className="auth-title">Password updated!</h2>
                        <p className="auth-desc">Your password has been changed. You can now sign in with the new password.</p>
                        <Link to="/login" replace
                              className="btn btn--primary"
                              style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
                            Sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="auth-title">Set new password</h2>
                        <p className="auth-desc">Choose a new password for your PharmaMS account.</p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="new-password" className="form-label">
                                    New password <span className="form-required">*</span>
                                </label>
                                <div className="auth-input-wrap">
                                    <input
                                        id="new-password"
                                        type={showPwd ? 'text' : 'password'}
                                        className={`form-input ${errors.newPassword ? 'form-input--error' : ''}`}
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        autoComplete="new-password"
                                        onChange={e => { setNewPassword(e.target.value); setErrors(er => ({...er, newPassword: ''})); }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowPwd(v => !v)}
                                        aria-label={showPwd ? 'Hide password' : 'Show password'}
                                    >
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.newPassword && <p className="form-error">{errors.newPassword}</p>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm-password" className="form-label">
                                    Confirm password <span className="form-required">*</span>
                                </label>
                                <input
                                    id="confirm-password"
                                    type={showPwd ? 'text' : 'password'}
                                    className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`}
                                    placeholder="Repeat the new password"
                                    value={confirmPassword}
                                    autoComplete="new-password"
                                    onChange={e => { setConfirmPassword(e.target.value); setErrors(er => ({...er, confirmPassword: ''})); }}
                                />
                                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                style={{ width: '100%', marginTop: 8 }}
                            >
                                Update password
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;