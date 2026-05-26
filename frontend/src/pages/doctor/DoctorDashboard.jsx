import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import axiosClient from '../../api/AxiosClient';
import Navbar from '../../components/Navbar';
import './DoctorDashboard.css';

function DoctorDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        axiosClient.get('/appointments/my')
            .then(res => setAppointments(res.data))
            .catch(err => {
                console.error('Failed to load appointments:', err);
                setError('Could not load appointments.');
            })
            .finally(() => setLoading(false));
    }, []);

    const parseAppointmentDate = (dateStr, timeStr) => {
        const date = new Date(dateStr);
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const pendingAppointments = appointments
        .filter(a => a.status === 'pending')
        .sort((a, b) => parseAppointmentDate(a.date, a.time) - parseAppointmentDate(b.date, b.time));

    const upcomingAppointments = appointments
        .filter(a => {
            const apptDate = parseAppointmentDate(a.date, a.time);
            return a.status === 'accepted' && apptDate >= new Date();
        })
        .sort((a, b) => parseAppointmentDate(a.date, a.time) - parseAppointmentDate(b.date, b.time));

    const totalPatients = new Set(
        appointments
            .filter(a => ['accepted', 'completed'].includes(a.status))
            .map(a => a.patient._id)
    ).size;

    const handleAccept = async (id) => {
        try {
            await axiosClient.patch(`/appointments/${id}/accept`);
            setAppointments(prev => prev.map(a =>
                a._id === id ? { ...a, status: 'accepted' } : a
            ));
            setSuccess('Appointment accepted successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to accept appointment.');
        }
    };

    const handleReject = async (id) => {
        try {
            await axiosClient.patch(`/appointments/${id}/reject`, { reason: rejectReason });
            setAppointments(prev => prev.map(a =>
                a._id === id ? { ...a, status: 'rejected', rejectionReason: rejectReason } : a
            ));
            setRejectingId(null);
            setRejectReason('');
            setSuccess('Appointment rejected.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject appointment.');
        }
    };
    if (loading) {
        return (
            <div className="page">
                <div className="card dashboard-card doctor-dashboard">
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
            <div className="card">
            <div className="card dashboard-card doctor-dashboard">
                <Navbar />

                <div style={{ padding: '36px 56px' }}>
                    <h1>Doctor Dashboard</h1>
                <div className="dashboard-body">
                    <div className="dashboard-header">
                        <h1 className="dash-headline">
                            Welcome back, <em>Dr. {user?.name || 'Doctor'}</em>
                        </h1>
                        <p className="dash-sub">Manage your appointment requests and schedule.</p>
                        {error && <div className="error-banner">{error}</div>}
                    </div>

                    {success && <div className="success-banner">{success}</div>}

                    <div className="metric-grid">
                        <div className="metric-card">
                            <p className="metric-label">Pending requests</p>
                            <p className="metric-value">{pendingAppointments.length}</p>
                        </div>
                        <div className="metric-card">
                            <p className="metric-label">Upcoming appointments</p>
                            <p className="metric-value">{upcomingAppointments.length}</p>
                        </div>
                        <div className="metric-card">
                            <p className="metric-label">Total patients</p>
                            <p className="metric-value">{totalPatients}</p>
                        </div>
                    </div>

                    {/* Pending requests */}
                    <p className="section-title" style={{ marginTop: '10px' }}>Pending requests</p>
                    {pendingAppointments.length === 0 ? (
                        <div className="no-appt-card">
                            <p>No pending appointment requests.</p>
                        </div>
                    ) : (
                        <div className="appts-table-wrap">
                            <table className="appts-table pending-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Phone</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingAppointments.map(a => (
                                        <React.Fragment key={a._id}>
                                            <tr className="appt-row">
                                                <td>{a.patient.name}</td>
                                                <td className="muted">{a.patient.phone}</td>
                                                <td>{formatDate(a.date)}</td>
                                                <td>{a.time}</td>
                                                <td>
                                                    <div className="action-cell">
                                                        <button
                                                            className="btn-accept"
                                                            onClick={() => handleAccept(a._id)}
                                                            type="button"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            className="btn-reject"
                                                            onClick={() => {
                                                                setRejectingId(rejectingId === a._id ? null : a._id);
                                                                setRejectReason('');
                                                            }}
                                                            type="button"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {rejectingId === a._id && (
                                                <tr className="reject-expand-row">
                                                    <td colSpan="5">
                                                        <div className="reject-inline">
                                                            <input
                                                                className="reject-input"
                                                                type="text"
                                                                placeholder="Reason for rejection (optional)"
                                                                value={rejectReason}
                                                                onChange={e => setRejectReason(e.target.value)}
                                                                maxLength={200}
                                                                autoFocus
                                                            />
                                                            <button
                                                                className="btn-reject-confirm"
                                                                onClick={() => handleReject(a._id)}
                                                                type="button"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                className="btn-cancel-reject"
                                                                onClick={() => setRejectingId(null)}
                                                                type="button"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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

export default DoctorDashboard;export default DoctorDashboard;
