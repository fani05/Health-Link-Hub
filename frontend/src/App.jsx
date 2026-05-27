import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import MedicalRecordsPage from './pages/doctor/MedicalRecordsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import PatientDashboard from './pages/patient/PatientDashboard';
import AppointmentsPage from './pages/patient/AppointmentsPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    } />
                    <Route path="/register" element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    } />
                    <Route path="/doctor-dashboard" element={
                        <ProtectedRoute allowedRole="doctor">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/doctor-medical-records" element={
                        <ProtectedRoute allowedRole="doctor">
                            <MedicalRecordsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/patient-dashboard" element={
                        <ProtectedRoute allowedRole="patient">
                            <PatientDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/patient-dashboard/appointments" element={
                        <ProtectedRoute allowedRole="patient">
                            <AppointmentsPage />
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;