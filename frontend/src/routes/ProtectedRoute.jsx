import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProtectedRoute({ children, allowedRole }) {
    const { user, loading } = useAuth();

    if (loading && !user) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute;