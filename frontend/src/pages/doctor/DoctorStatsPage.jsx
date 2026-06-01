import { useState, useEffect } from 'react';
import axiosClient from '../../api/AxiosClient';
import Navbar from '../../components/Navbar';
import './DoctorStatsPage.css';

function DoctorStatsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/medical-records/stats')
            .then(res => setStats(res.data))
            .catch(() => setError('Could not load statistics.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page">
            <div className="card dashboard-card doctor-stats">
                <Navbar />
                <div className="dashboard-body">
                    <div className="dashboard-header">
                        <h1 className="dash-headline">Statistics</h1>
                        <p className="dash-sub">Overview of your medical activity</p>
                    </div>

                    {loading ? (
                        <p className="stats-hint">Loading...</p>
                    ) : error ? (
                        <p className="stats-error">{error}</p>
                    ) : (
                        <>
                            <div className="metric-grid">
                                <div className="metric-card">
                                    <p className="metric-label">Patients Treated</p>
                                    <p className="metric-value">{stats.totalPatients}</p>
                                </div>
                                <div className="metric-card">
                                    <p className="metric-label">Total Revenue</p>
                                    <p className="metric-value">
                                        {stats.totalRevenue.toFixed(0)}
                                        <span className="metric-unit"> RON</span>
                                    </p>
                                </div>
                                <div className="metric-card">
                                    <p className="metric-label">Completed Appointments</p>
                                    <p className="metric-value">{stats.completedAppointments}</p>
                                </div>
                                <div className="metric-card metric-card--warn">
                                    <p className="metric-label">No-shows</p>
                                    <p className="metric-value">{stats.noShows}</p>
                                </div>
                            </div>

                            {stats.topProcedures.length > 0 && (
                                <div className="stats-section">
                                    <div className="section-header">
                                        <p className="section-title">Top Procedures</p>
                                    </div>
                                    <div className="procedures-list">
                                        {stats.topProcedures.map((p, i) => (
                                            <div key={i} className="procedure-row">
                                                <span className="procedure-name">{p.name}</span>
                                                <div className="procedure-bar-wrap">
                                                    <div
                                                        className="procedure-bar"
                                                        style={{ width: `${(p.count / stats.topProcedures[0].count) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="procedure-count">{p.count}×</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {stats.topProcedures.length === 0 && (
                                <div className="no-appt-card">
                                    No medical records yet. Reports will appear here once you create them.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DoctorStatsPage;
