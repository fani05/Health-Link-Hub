import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/AxiosClient';
import Navbar from '../../components/Navbar';
import './InterventionHistoryPage.css';

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
});

const formatCost = (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

function InterventionHistoryPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        axiosClient.get('/medical-records/mine')
            .then(res => setRecords(res.data))
            .catch(err => {
                console.error('Failed to load interventions:', err);
                setError('Could not load your intervention history.');
            })
            .finally(() => setLoading(false));
    }, []);

    const totalSpent = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

    const getInterventionDate = (r) => {
        if (r.appointment?.date) return r.appointment.date;
        return r.createdAt;
    };

    const sortedRecords = [...records].sort((a, b) => {
        return new Date(getInterventionDate(b)) - new Date(getInterventionDate(a));
    });

    if (loading) {
        return (
            <div className="page">
                <div className="card interventions-card">
                    <Navbar />
                    <div className="interventions-body">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="card interventions-card">
                <Navbar />

                <div className="interventions-body">
                    <div className="interventions-header">
                        <h1 className="interventions-headline">
                            Intervention <em>history</em>
                        </h1>
                        <p className="interventions-sub">
                            A record of your past treatments and their associated costs.
                        </p>
                        {error && <div className="error-banner">{error}</div>}
                    </div>

                    <div className="metric-grid two-cols">
                        <div className="metric-card">
                            <p className="metric-label">Total interventions</p>
                            <p className="metric-value">{records.length}</p>
                        </div>
                        <div className="metric-card">
                            <p className="metric-label">Total spent</p>
                            <p className="metric-value">{formatCost(totalSpent)} RON</p>
                        </div>
                    </div>

                    <p className="section-title">Past treatments</p>

                    {records.length === 0 ? (
                        <div className="no-appt-card">
                            <p>You don't have any recorded interventions yet.</p>
                            <Link to="/patient-dashboard/appointments" className="btn-book">
                                Book an appointment
                            </Link>
                        </div>
                    ) : (
                        <div className="interventions-list">
                            {sortedRecords.map(r => {
                                const isOpen = expandedId === r._id;
                                return (
                                    <div
                                        key={r._id}
                                        className={`intervention-card ${isOpen ? 'open' : ''}`}
                                    >
                                        <div
                                            className="intervention-summary"
                                            onClick={() => setExpandedId(isOpen ? null : r._id)}
                                        >
                                            <div className="intervention-main">
                                                <p className="intervention-procedure">
                                                    {r.procedure}
                                                </p>
                                                <p className="intervention-doctor">
                                                    {r.doctor?.name || 'Unknown doctor'}
                                                    {r.doctor?.specialization && (
                                                        <span className="intervention-spec">
                                                            {' — '}{r.doctor.specialization}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="intervention-date">
                                                    📅 {formatDate(getInterventionDate(r))}
                                                    {r.appointment?.time && (
                                                        <span> · 🕐 {r.appointment.time}</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="intervention-right">
                                                <p className="intervention-cost">
                                                    {formatCost(r.cost)} RON
                                                </p>
                                                <span className="intervention-chevron">
                                                    {isOpen ? '▴' : '▾'}
                                                </span>
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <div className="intervention-details">
                                                <p className="details-label">Observations</p>
                                                <p className="details-text">
                                                    {r.observations?.trim()
                                                        ? r.observations
                                                        : 'No additional observations were recorded.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InterventionHistoryPage;
