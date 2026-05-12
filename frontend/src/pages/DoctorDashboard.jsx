import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './DoctorDashboard.css';

function DoctorDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="page">
            <div className="card">
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
                        <Link to="/">Home</Link>
                        <button className="btn-logout" onClick={handleLogout}>Log out</button>
                    </div>
                </nav>

                <div style={{ padding: '36px 56px' }}>
                    <h1>Doctor Dashboard</h1>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;