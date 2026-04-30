import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        // verify if token exists in headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized, token missing' });
        }

        // extract token from header
        const token = authHeader.split(' ')[1];

        // verify token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user by decoded id and attach to request object (exclude password)
        req.user = await User.findById(decoded.id).select('-password');

        next();
    } catch {
        res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};
