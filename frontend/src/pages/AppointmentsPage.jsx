import { useState, useEffect } from 'react';
import axiosClient from '../api/AxiosClient';
import Navbar from '../components/Navbar';
import './AppointmentsPage.css';
import { useNavigate } from 'react-router-dom';

const ALL_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                   '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
                   '16:00', '16:30'];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

function AppointmentsPage() {

    
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [occupiedSlots, setOccupiedSlots] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    // month and year
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [viewYear, setViewYear] = useState(today.getFullYear());

    // 1. request doctors on mount
    useEffect(() => {
        axiosClient.get('/appointments/doctors')
            .then(res => setDoctors(res.data))
            .catch(err => {
                console.error('Failed to load doctors:', err);
                setError('Could not load doctors. Please try again.');
            })
            .finally(() => setLoading(false));
    }, []);

    // 2. request occupied slots when doctor or date changes
    useEffect(() => {
        if (!selectedDoctor || !selectedDate) {
            setOccupiedSlots([]);
            return;
        }

        const dateStr = formatDateISO(selectedDate);
        axiosClient.get('/appointments/slots', {
            params: { doctor: selectedDoctor._id, date: dateStr }
        })
            .then(res => setOccupiedSlots(res.data))
            .catch(err => console.error('Failed to load slots:', err));
    }, [selectedDoctor, selectedDate]);

    // Helper: Date -> "2026-05-20"
    const formatDateISO = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Helper: Date -> "May 20, 2026"
    const formatDateLong = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const buildCalendar = () => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        // getDay(): 0=Sun..6=Sat. We want Mon=0..Sun=6
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        const cells = [];
        for (let i = 0; i < startOffset; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(new Date(viewYear, viewMonth, d));
        }
        while (cells.length < 42) cells.push(null);
        return cells;
    };

    const isPast = (date) => date < today;
    const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
    const isSelectable = (date) => date && !isPast(date) && !isWeekend(date);

    const isSameDay = (a, b) => {
        if (!a || !b) return false;
        return a.getFullYear() === b.getFullYear()
            && a.getMonth() === b.getMonth()
            && a.getDate() === b.getDate();
    };

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!selectedDoctor || !selectedDate || !selectedTime) {
            setError('Please select a doctor, a date and a time slot.');
            return;
        }

        setSubmitting(true);
        try {
            await axiosClient.post('/appointments', {
                doctor: selectedDoctor._id,
                date: formatDateISO(selectedDate),
                time: selectedTime,
            });
            navigate('/patient-dashboard', {
                state: { message: 'Appointment requested successfully!' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    const calendarCells = buildCalendar();

    return (
        <div className="page">
            <div className="card appts-page-card">
                <Navbar />

                <div className="appts-body">
                    <div className="appts-header">
                        <h1 className="appts-headline">Book an <em>appointment</em></h1>
                        <p className="appts-sub">
                            Select a doctor, pick a date, then choose an available time slot.
                        </p>
                        {error && <p className="error-banner">{error}</p>}
                    </div>

                    
                    {loading ? (
                        <p>Loading doctors...</p>
                    ) : (
                        <div className="appts-grid">
                            <div className="appts-col-left">
                                <p className="step-label">1. Select doctor</p>
                                <div className="doctor-list">
                                    {doctors.length === 0 ? (
                                        <p className="empty-hint">No doctors available.</p>
                                    ) : doctors.map(d => (
                                        <div
                                            key={d._id}
                                            className={`doctor-card ${selectedDoctor?._id === d._id ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedDoctor(d);
                                                setSelectedTime(null);
                                            }}
                                        >
                                            <p className="doctor-name">{d.name}</p>
                                            <p className="doctor-spec">{d.specialization}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="appts-col-right">
                                <p className="step-label">2. Pick a date</p>
                                <div className="calendar">
                                    <div className="cal-header">
                                        <button className="cal-nav" onClick={prevMonth} type="button">‹</button>
                                        <span className="cal-month">
                                            {MONTH_NAMES[viewMonth]} {viewYear}
                                        </span>
                                        <button className="cal-nav" onClick={nextMonth} type="button">›</button>
                                    </div>
                                    <div className="cal-grid">
                                        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                                            <span key={d} className="cal-day-name">{d}</span>
                                        ))}
                                        {calendarCells.map((date, i) => {
                                            if (!date) {
                                                return <span key={i} className="cal-day empty"></span>;
                                            }
                                            const selectable = isSelectable(date);
                                            const selected = isSameDay(date, selectedDate);
                                            return (
                                                <span
                                                    key={i}
                                                    className={`cal-day ${selected ? 'selected' : ''} ${!selectable ? 'disabled' : ''}`}
                                                    onClick={() => {
                                                        if (selectable) {
                                                            setSelectedDate(date);
                                                            setSelectedTime(null);
                                                        }
                                                    }}
                                                >
                                                    {date.getDate()}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                <p className="step-label">3. Choose a time</p>
                                {!selectedDoctor || !selectedDate ? (
                                    <p className="empty-hint">
                                        Select a doctor and a date first.
                                    </p>
                                ) : (
                                    <div className="time-slots">
                                        {ALL_SLOTS.map(slot => {
                                            const taken = occupiedSlots.includes(slot);
                                            const selected = selectedTime === slot;
                                            return (
                                                <span
                                                    key={slot}
                                                    className={`time-slot ${selected ? 'selected' : ''} ${taken ? 'unavailable' : ''}`}
                                                    onClick={() => !taken && setSelectedTime(slot)}
                                                >
                                                    {slot}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="appts-footer">
                                    <div>
                                        <p className="footer-label">Selected:</p>
                                        <p className="footer-value">
                                            {selectedDoctor ? selectedDoctor.name : '—'}
                                            {selectedDate ? ` — ${formatDateLong(selectedDate)}` : ''}
                                            {selectedTime ? ` at ${selectedTime}` : ''}
                                        </p>
                                    </div>
                                    <button
                                        className="btn-request"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        type="button"
                                    >
                                        {submitting ? 'Requesting...' : 'Request appointment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AppointmentsPage;