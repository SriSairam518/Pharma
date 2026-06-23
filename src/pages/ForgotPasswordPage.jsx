// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, ArrowLeft, Mail } from 'lucide-react';
import { authApi } from '../services/api';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email,     setEmail]     = useState('');
    const [loading,   setLoading]   = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error,     setError]     = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) { setError('Email is required'); return; }
        setLoading(true);
        try {
            await authApi.forgotPassword(email.trim());
            setSubmitted(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

                {submitted ? (
                    <div className="auth-success">
                        <div className="auth-success__icon"><Mail size={32} /></div>
                        <h2 className="auth-title">Check your email</h2>
                        <p className="auth-desc">
                            If <strong>{email}</strong> is registered, a password reset link has been sent.
                            The link expires in 15 minutes.
                        </p>
                        <p className="auth-desc" style={{ fontSize: 13, color: 'var(--text-3)' }}>
                            Check your spam folder if you don't see it in your inbox.
                        </p>
                        <Link to="/login" className="btn btn--primary" style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
                            Back to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2 className="auth-title">Forgot password?</h2>
                        <p className="auth-desc">
                            Enter your registered email address and we'll send you a reset link.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email address <span className="form-required">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className={`form-input ${error ? 'form-input--error' : ''}`}
                                    placeholder="your@gmail.com"
                                    value={email}
                                    autoComplete="email"
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    autoFocus
                                />
                                {error && <p className="form-error">{error}</p>}
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                loading={loading}
                                style={{ width: '100%', marginTop: 8 }}
                            >
                                Send reset link
                            </Button>
                        </form>

                        <div className="auth-back">
                            <Link to="/login" className="auth-link">
                                <ArrowLeft size={14} /> Back to sign in
                            </Link>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default ForgotPasswordPage;