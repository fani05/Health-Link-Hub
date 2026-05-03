import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
//import RegisterPage from './pages/RegisterPage';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;