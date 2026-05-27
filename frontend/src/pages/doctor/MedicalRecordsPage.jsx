import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import axiosClient from '../../api/AxiosClient';
import Navbar from '../../components/Navbar';
import './MedicalRecordsPage.css';

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
});

function MedicalRecordsPage() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [pendingAppts, setPendingAppts] = useState([]);
    const [records, setRecords] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
    const [addingForAppt, setAddingForAppt] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form, setForm] = useState({ procedure: '', cost: '', observations: '' });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingPatient, setLoadingPatient] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axiosClient.get('/medical-records/patients')
            .then(res => setPatients(res.data))
            .catch(() => setError('Could not load patients.'))
            .finally(() => setLoading(false));
    }, []);
    return (
        <div className="page">
            <div className="card records-card">
                <Navbar />
                <div className="records-layout">
                    <div className="patients-panel">
                        <p className="patients-panel-title">Patients</p>
                        <input
                            className="patient-search"
                            type="text"
                            placeholder="Search patients..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {loading ? (
                            <p className="panel-hint">Loading...</p>
                        ) : patients.length === 0 ? (
                            <p className="panel-hint">No patients yet.</p>
                        ) : (
                            <div className="patients-list">
                                {patients
                                    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
                                    .map(p => (
                                        <div
                                            key={p._id}
                                            className={`patient-row ${selectedPatient?._id === p._id ? 'selected' : ''}`}
                                            onClick={() => setSelectedPatient(p)}
                                        >
                                            <p className="patient-name">{p.name}</p>
                                            <p className="patient-phone">{p.phone}</p>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <div className="details-panel">
                        {!selectedPatient ? (
                            <div className="no-selection">
                                <p>Select a patient from the list to view their records.</p>
                            </div>
                        ) : (
                            <>
                                <div className="details-header">
                                    <p className="details-patient-name">{selectedPatient.name}</p>
                                    <p className="details-patient-phone">{selectedPatient.phone}</p>
                                </div>
                                {renderPatientPanel()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MedicalRecordsPage;
