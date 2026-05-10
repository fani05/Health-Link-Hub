import { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (token) {
            axiosClient.get('/auth/me')
                .then(res => setUser(res.data))
                .catch((error) => {
                    if (error.response?.status === 401) {
                        clearStorage();
                        setUser(null);
                    }
                })
                .finally(() => setLoading(false));
        } else {
            clearStorage();
            setUser(null);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};