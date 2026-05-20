import { useState, useEffect } from 'react';
import { Link, useLocation} from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import axiosClient from '../api/AxiosClient';
import Navbar from '../components/Navbar';
import './PatientDashboard.css';

function PatientDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [expandedId, setExpandedId] = useState(null);
    const location = useLocation();
    const successMessage = location.state?.message;
    
    useEffect(() => {
        axiosClient.get('/appointments/mine')
            .then(res => setAppointments(res.data))
            .catch(err => {
                console.error('Failed to load appointments:', err);
                setError('Could not load your appointments.');
            })
            .finally(() => setLoading(false));
    }, []);

    // convert string date + time to Date object for easier comparisons
    const parseAppointmentDate = (dateStr, timeStr) => {
        const date = new Date(dateStr);
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
    };
    
    // how many upcoming appointments (accepted + in the future)
    const upcomingCount = appointments.filter(a => {
        const apptDate = parseAppointmentDate(a.date, a.time);
        return a.status === 'accepted' && apptDate >= new Date();
    }).length;

    const pendingCount = appointments.filter(a => a.status === 'pending').length;

    // how many total interventions (completed appointments)
    const interventionsCount = 0;

    const activeAppointments = appointments.filter(a => {
        const apptDate = parseAppointmentDate(a.date, a.time);
        return a.status !== 'completed' && apptDate >= new Date();
    });

    // next appointment = accepted + in the future + closest date
    const nextAppointment = appointments
        .filter(a => {
            const apptDate = parseAppointmentDate(a.date, a.time);
            return a.status === 'accepted' && apptDate >= new Date();
        })
        .sort((a, b) => parseAppointmentDate(a.date, a.time) - parseAppointmentDate(b.date, b.time))[0];

    // Helper: how many days/hours until a date
    const getTimeUntil = (dateStr, timeStr) => {
        const now = new Date(); 
        const target = parseAppointmentDate(dateStr, timeStr);
        
        const diff = target - now;

        if (isNaN(diff) || diff <= 0) {
            return { days: 0, hours: 0 };
        }

        // convert diff from ms to days and hours
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return { days, hours };
    };

    // Helper: "May 20, 2026"
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await axiosClient.patch(`/appointments/${id}/cancel`);
            setAppointments(prev => prev.map(a =>
                // ...a clone of a
                a._id === id ? { ...a, status: 'cancelled' } : a
            ));
        } catch (err) {
            console.error('Failed to cancel:', err);
        }
    };

    const timeLeft = nextAppointment 
        ? getTimeUntil(nextAppointment.date, nextAppointment.time) 
        : { days: 0, hours: 0 };
    

    if (loading) {
        return (
            <div className="page">
                <div className="card dashboard-card">
                    <Navbar />
                    <div className="dashboard-body">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="card dashboard-card">
                <Navbar />

                <div className="dashboard-body">
                    <div className="dashboard-header">
                        <h1 className="dash-headline">
                            Welcome back, <em>{user?.name || 'Patient'}</em>
                        </h1>
                        <p className="dash-sub">Here's an overview of your medical activity.</p>
                        {error && <div className="error-banner">{error}</div>}
                        {successMessage && <div className="success-banner">{successMessage}</div>}
                    </div>


                    {/* Metric cards */}
                    <div className="metric-grid">
                        <div className="metric-card">
                            <p className="metric-label">Upcoming appointments</p>
                            <p className="metric-value">{upcomingCount}</p>
                        </div>
                        <div className="metric-card">
                            <p className="metric-label">Pending requests</p>
                            <p className="metric-value">{pendingCount}</p>
                        </div>
                        <div className="metric-card">
                            <p className="metric-label">Total interventions</p>
                            <p className="metric-value">{interventionsCount}</p>
                        </div>
                    </div>

                    {/* Next appointment */}
                    <p className="section-title">Next appointment</p>
                    {nextAppointment ? (
                        <div className="next-appt-card">
                            <div className="next-appt-left">
                                <div className="appt-avatar">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 2v6a4 4 0 0 0 8 0V2" strokeLinecap="round"/>
                                        <path d="M10 12v4a4 4 0 0 0 8 0v-2" strokeLinecap="round"/>
                                        <circle cx="18" cy="10" r="2"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="appt-doctor">{nextAppointment.doctor.name}</p>
                                    <p className="appt-spec">{nextAppointment.doctor.specialization}</p>
                                    <div className="appt-meta">
                                        <span>📅 {formatDate(nextAppointment.date)}</span>
                                        <span>🕐 {nextAppointment.time}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="next-appt-right">
                                <p className="countdown-label">In</p>
                                <p className="countdown-value">
                                    {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''} 
                                    {timeLeft.hours}h
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="no-appt-card">
                            <p>No upcoming appointments</p>
                            <Link to="/patient-dashboard/appointments" className="btn-book">
                                Book one now
                            </Link>
                        </div>
                    )}

                    {/* Upcoming appointments */}
                    <div className="section-header">
                        <p className="section-title">Upcoming appointments</p>
                        {activeAppointments.length > 4 && (
                            <span className="scroll-hint">↓ scroll for more</span>
                        )}
                    </div>
                    {activeAppointments.length === 0 ? (
                        <div className="no-appt-card">
                            <p>No upcoming appointments</p>
                            <Link to="/patient-dashboard/appointments" className="btn-book">
                                Book one now
                            </Link>
                        </div>
                    ) : (
                        <div className="appts-table-wrap">
                            <table className="appts-table">
                                <thead>
                                    <tr>
                                        <th>Doctor</th>
                                        <th>Specialization</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeAppointments
                                        .sort((a, b) => {
                                            const dateA = parseAppointmentDate(a.date, a.time);
                                            const dateB = parseAppointmentDate(b.date, b.time);
                                            return dateA - dateB;
                                        })
                                        .map(a => (

                                            <tr key={a._id} className="appt-row">
                                                <td>{a.doctor.name}</td>
                                                <td className="muted">{a.doctor.specialization}</td>
                                                <td>{formatDate(a.date)}</td>
                                                <td>{a.time}</td>
                                                <td>
                                                    <div className="status-cell">
                                                        <span className={`status-badge status-${a.status}`}>
                                                            {a.status}
                                                        </span>
                                                        <span className="info-btn-slot">
                                                            {(a.status === 'pending' || a.status === 'accepted') && (
                                                                <button
                                                                    className="info-btn"
                                                                    onClick={() => handleCancel(a._id)}
                                                                    type="button"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                            {(a.status === 'rejected' && a.rejectionReason) && (
                                                                <button
                                                                    className="info-btn"
                                                                    onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                                                                    type="button"
                                                                >
                                                                    ?
                                                                </button>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                {expandedId === a._id && (
                                                    <td className={`row-overlay ${a.status}`} colSpan="5">
                                                        <span className="overlay-text">
                                                            {a.rejectionReason}
                                                        </span>
                                                        <button
                                                            className="overlay-close"
                                                            onClick={() => setExpandedId(null)}
                                                            type="button"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;