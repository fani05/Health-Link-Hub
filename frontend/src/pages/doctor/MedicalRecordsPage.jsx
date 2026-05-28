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

    useEffect(() => {
        if (!selectedPatient) return;
        setLoadingPatient(true);
        setView('list');
        setError('');
        axiosClient.get(`/medical-records/patients/${selectedPatient._id}`)
            .then(res => {
                setPendingAppts(res.data.pendingAppts);
                setRecords(res.data.records);
            })
            .catch(() => setError('Could not load patient data.'))
            .finally(() => setLoadingPatient(false));
    }, [selectedPatient]);

    const handleNoShow = async (appointmentId) => {
        if (!window.confirm('Mark this appointment as no-show?')) return;
        try {
            await axiosClient.patch(`/medical-records/appointment/${appointmentId}/no-show`);
            setPendingAppts(prev => prev.filter(a => a._id !== appointmentId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark as no-show.');
        }
    };

    const openAddForm = (appt) => {
        setAddingForAppt(appt);
        setForm({ procedure: '', cost: '', observations: '' });
        setError('');
        setView('add');
    };

    const openEditForm = (record) => {
        setEditingRecord(record);
        setForm({ procedure: record.procedure, cost: record.cost, observations: record.observations });
        setError('');
        setView('edit');
    };

    const handleSubmitAdd = async () => {
        if (!form.procedure.trim() || form.cost === '') {
            setError('Procedure and cost are required.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await axiosClient.post('/medical-records', {
                appointmentId: addingForAppt._id,
                procedure: form.procedure,
                cost: Number(form.cost),
                observations: form.observations,
            });
            setPendingAppts(prev => prev.filter(a => a._id !== addingForAppt._id));
            setRecords(prev => [res.data, ...prev]);
            setView('list');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create record.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitEdit = async () => {
        if (!form.procedure.trim() || form.cost === '') {
            setError('Procedure and cost are required.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await axiosClient.put(`/medical-records/${editingRecord._id}`, {
                procedure: form.procedure,
                cost: Number(form.cost),
                observations: form.observations,
            });
            setRecords(prev => prev.map(r => r._id === editingRecord._id ? res.data : r));
            setView('list');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update record.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!window.confirm('Delete this medical record? The appointment will be moved back to pending action.')) return;
        try {
            await axiosClient.delete(`/medical-records/${recordId}`);
            const deleted = records.find(r => r._id === recordId);
            setRecords(prev => prev.filter(r => r._id !== recordId));
            if (deleted?.appointment) {
                setPendingAppts(prev => [deleted.appointment, ...prev]);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete record.');
        }
    };

    const renderForm = () => {
        const isAdd = view === 'add';
        const appt = isAdd ? addingForAppt : editingRecord?.appointment;
        return (
            <div className="record-form">
                <p className="form-title">{isAdd ? 'New Medical Report' : 'Edit Report'}</p>
                <div className="form-meta">
                    <div>
                        <span className="form-meta-label">Patient</span>
                        <span className="form-meta-value">{selectedPatient?.name}</span>
                    </div>
                    <div>
                        <span className="form-meta-label">Doctor</span>
                        <span className="form-meta-value">Dr. {user?.name}</span>
                    </div>
                    {appt && (
                        <>
                            <div>
                                <span className="form-meta-label">Date</span>
                                <span className="form-meta-value">{formatDate(appt.date)}</span>
                            </div>
                            <div>
                                <span className="form-meta-label">Time</span>
                                <span className="form-meta-value">{appt.time}</span>
                            </div>
                        </>
                    )}
                </div>

                <label className="form-label">Procedure *</label>
                <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Consultation, X-ray, Blood test..."
                    value={form.procedure}
                    onChange={e => setForm(f => ({ ...f, procedure: e.target.value }))}
                    maxLength={200}
                />

                <label className="form-label">Cost (RON) *</label>
                <input
                    className="form-input form-input-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.cost}
                    onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                />

                <label className="form-label">Observations</label>
                <textarea
                    className="form-textarea"
                    placeholder="Describe what happened during the appointment, findings, recommendations..."
                    value={form.observations}
                    onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                    maxLength={1000}
                    rows={5}
                />

                {error && <p className="form-error">{error}</p>}
                <div className="form-actions">
                    <button
                        className="btn-save-report"
                        onClick={isAdd ? handleSubmitAdd : handleSubmitEdit}
                        disabled={submitting}
                        type="button"
                    >
                        {submitting ? 'Saving...' : 'Save Report'}
                    </button>
                    <button
                        className="btn-form-cancel"
                        onClick={() => { setView('list'); setError(''); }}
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    };

    const renderPatientPanel = () => {
        if (loadingPatient) return <p className="panel-hint">Loading...</p>;
        if (view === 'add' || view === 'edit') return renderForm();

        return (
            <>
                {pendingAppts.length > 0 && (
                    <div className="panel-section">
                        <p className="panel-section-title">Needs action</p>
                        <div className="needs-action-list">
                            {pendingAppts.map(a => (
                                <div key={a._id} className="action-appt-row">
                                    <span className="action-appt-date">
                                        {formatDate(a.date)} · {a.time}
                                    </span>
                                    <div className="action-appt-btns">
                                        <button className="btn-create-report" onClick={() => openAddForm(a)} type="button">
                                            Create Report
                                        </button>
                                        <button className="btn-no-show" onClick={() => handleNoShow(a._id)} type="button">
                                            No-show
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="panel-section">
                    <p className="panel-section-title">Medical Records</p>
                    {records.length === 0 ? (
                        <div className="no-records-hint">No medical records yet.</div>
                    ) : (
                        <div className="records-list">
                            {records.map(r => (
                                <div key={r._id} className="record-row">
                                    <div className="record-row-info">
                                        <p className="record-procedure">{r.procedure}</p>
                                        <p className="record-meta">
                                            {formatDate(r.appointment?.date)} · {r.appointment?.time} · {r.cost} RON
                                        </p>
                                        {r.observations && (
                                            <p className="record-obs">{r.observations}</p>
                                        )}
                                    </div>
                                    <div className="record-row-actions">
                                        <button className="btn-edit-record" onClick={() => openEditForm(r)} type="button">
                                            Edit
                                        </button>
                                        <button className="btn-delete-record" onClick={() => handleDelete(r._id)} type="button">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && <p className="panel-error">{error}</p>}
            </>
        );
    };

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
