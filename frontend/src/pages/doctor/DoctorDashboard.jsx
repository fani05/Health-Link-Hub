import { useAuth } from '../../context/useAuth';
import Navbar from '../../components/Navbar';
import './DoctorDashboard.css';

function DoctorDashboard() {

    return (
        <div className="page">
            <div className="card">
                <Navbar />

                <div style={{ padding: '36px 56px' }}>
                    <h1>Doctor Dashboard</h1>
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;