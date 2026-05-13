import { useAuth } from '../context/useAuth';
import Navbar from '../components/Navbar';
import './PatientDashboard.css';

function PatientDashboard() {

    return (
        <div className="page">
            <div className="card">
                <Navbar />

                <div style={{ padding: '36px 56px' }}>
                    <h1>Patient Dashboard</h1>
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;