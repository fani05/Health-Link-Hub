import { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/AxiosClient';

export const AuthContext = createContext();

const getStoredUser = () => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return null;
        const str = localStorage.getItem('user') || sessionStorage.getItem('user');
        return str ? JSON.parse(str) : null;
    } catch {
        return null;
    }
};

const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);
    // If there's no token we're not loading — no async check needed
    const [loading, setLoading] = useState(
        () => !!(localStorage.getItem('token') || sessionStorage.getItem('token'))
    );

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const checkUser = async () => {
            try {
                const res = await axiosClient.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    clearStorage();
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    useEffect(() => { // Listen for unauthorized events to handle token expiration or invalidation
        const handleUnauthorized = () => {
            setUser(null);
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []); // [] ensures this runs only once and not on every render

    const login = async (email, password, remember) => {
        const res = await axiosClient.post('/auth/login', { email, password });
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('token', res.data.token);
        storage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        return res.data;
    };

    const logout = () => {
        setUser(null);
        clearStorage();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};