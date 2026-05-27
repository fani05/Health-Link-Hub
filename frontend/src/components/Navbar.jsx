import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
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
                {!user && (
                    <>
                        <Link to="/login">Home</Link>
                        <Link to="/register">Sign up</Link>
                    </>
                )}
                {user?.role === 'doctor' && (
                    <>
                        <Link to="/doctor-dashboard">Dashboard</Link>
                        <Link to="/doctor-medical-records">Medical Records</Link>
                    </>
                )}
                {user?.role === 'patient' && (
                    <>
                        <Link to="/patient-dashboard">Dashboard</Link>
                        <Link to="/patient-dashboard/appointments">Book Appointment</Link>
                    </>
                )}
                {user && (
                    <button className="btn-logout" onClick={handleLogout}>Log out</button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;