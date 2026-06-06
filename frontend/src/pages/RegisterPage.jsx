import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/AxiosClient';
import Navbar from '../components/Navbar';
import './RegisterPage.css';

function RegisterPage() {
    const [role, setRole] = useState('patient');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        const phoneRegex = /^\+?[1-9]\d{7,14}$/;
        const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm;

        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            setError('Please enter a valid phone number (e.g. +40712345678).');
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (role === 'doctor' && !specialization.trim()) {
            setError('Please specify your specialization.');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/auth/register', {
                name,
                email,
                password,
                role,
                phone,
                address,
                ...(role === 'doctor' && { specialization })
            });
            navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="card register-card">
                {/* Nav */}
                <Navbar />

                <div className="register-body">
                    <div className="register-header">
                        <h1 className="headline">
                            Create your <em>account</em>
                        </h1>
                        <p className="sub">
                            Join HealthLink Hub to manage appointments and medical records in one place.
                        </p>
                        {error && <div className="error-banner">{error}</div>}
                    </div>

                    <div className="role-toggle">
                        <button
                            type="button"
                            className={`role-btn ${role === 'patient' ? 'active' : ''}`}
                            onClick={() => setRole('patient')}
                        >
                            <span className="role-icon">👨🏻‍💼</span>
                            I'm a patient
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${role === 'doctor' ? 'active' : ''}`}
                            onClick={() => setRole('doctor')}
                        >
                            <span className="role-icon">👨🏻‍⚕️</span>
                            I'm a doctor
                        </button>
                    </div>

                    <form onSubmit={handleRegister} className="register-form">
                        <div className="form-grid">
                            <div className="field">
                                <label>Full name</label>
                                <div className="input-wrap">
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

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
                                <label>Phone</label>
                                <div className="input-wrap">
                                    <input
                                        type="tel"
                                        placeholder="+40xxxxxxxxx"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label>Address</label>
                                <div className="input-wrap">
                                    <input
                                        type="text"
                                        placeholder="Street, City"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {role === 'doctor' && (
                                <div className="field field-full">
                                    <label>Specialization</label>
                                    <div className="input-wrap">
                                        <input
                                            type="text"
                                            placeholder="e.g. Cardiology"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

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

                            <div className="field">
                                <label>Confirm password</label>
                                <div className="input-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? <span className="spinner"></span> : null}
                            {loading ? 'Creating account…' : 'Create account'}
                        </button>
                    </form>

                    <p className="signup-line">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;