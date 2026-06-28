
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, Eye, EyeOff } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd,  setShowPwd]  = useState(false);
    const [errors,   setErrors]   = useState({});
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!username.trim()) e.username = 'Username is required';
        if (!password)        e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const result = await login(username.trim(), password);
        if (result.success) navigate('/', { replace: true });
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

                <h2 className="auth-title">Sign in</h2>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username <span className="form-required">*</span>
                        </label>
                        <input
                            id="username"
                            type="text"
                            className={`form-input ${errors.username ? 'form-input--error' : ''}`}
                            placeholder="Enter your username"
                            value={username}
                            autoComplete="username"
                            onChange={e => { setUsername(e.target.value); setErrors(er => ({...er, username: ''})); }}
                            autoFocus
                        />
                        {errors.username && <p className="form-error">{errors.username}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password <span className="form-required">*</span>
                        </label>
                        <div className="auth-input-wrap">
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                                placeholder="Enter your password"
                                value={password}
                                autoComplete="current-password"
                                onChange={e => { setPassword(e.target.value); setErrors(er => ({...er, password: ''})); }}
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
                        {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>

                    <div className="auth-forgot">
                        <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        style={{ width: '100%', marginTop: 8 }}
                    >
                        Sign in
                    </Button>
                </form>

            </div>
        </div>
    );
};

export default LoginPage;