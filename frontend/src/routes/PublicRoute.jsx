import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (user) {
        return <Navigate to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} />;
    }

    return children;
}

export default PublicRoute;