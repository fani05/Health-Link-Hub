import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import clinicImg from '../assets/clinic.png';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password, remember);
            if (user.role === 'doctor') {
                navigate('/doctor-dashboard');
            } else {
                navigate('/patient-dashboard');
            }
        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="card">
                {/* Nav */}
                <nav className="nav">
                    <div className="brand">
                        <div className="brand-mark">
                            <svg viewBox="0 0 20 20" fill="none">
                                <path d="M10 3v14M3 10h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <span className="brand-name">Health<span>Link</span> Hub</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/" className="active">Home</Link>
                        <Link to="/register">Sign up</Link>
                    </div>
                </nav>

                {/* Hero */}
                <div className="hero">
                    {/* Form col */}
                    <div className="form-col">
                        <h1 className="headline">
                            Your health,<br /><em>connected.</em>
                        </h1>
                        <p className="sub">
                            Sign in to manage your appointments and access your medical history.
                        </p>

                        {error && <div className="error-banner">{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div className="field">
                                <label>Email</label>
                                <div className="input-wrap">
                                    <input
                                        type="email"
                                        placeholder="your.email@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label>Password</label>
                                <div className="input-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="toggle-pw"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div className="row">
                                <label className="check">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                    />
                                    <span className="box"></span>
                                    Remember me
                                </label>
                                <a href="#" className="forgot">Forgot password?</a>
                            </div>

                            <button type="submit" className="btn-login" disabled={loading}>
                                {loading ? (
                                    <span className="spinner"></span>
                                ) : null}
                                {loading ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>

                        <p className="signup-line">
                            Don't have an account? <Link to="/register">Sign up</Link>
                        </p>
                    </div>

                    {/* Illustration col */}
                    <div className="illus-col">
                        <div className="illus-frame rounded">
                            <img src={clinicImg} alt="Medical illustration" />
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
}

export default LoginPage;
