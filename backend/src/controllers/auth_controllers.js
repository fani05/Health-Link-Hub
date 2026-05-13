import User from '../models/User.js';
import jwt from 'jsonwebtoken';


const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// register route (POST /api/users/register)
export const registerUser = async (req, res) => {
    try {
        
        const { name, email, password, role, specialization, address, phone } = req.body;

        // validate role explicitly - for security
        const allowedRoles = ['patient', 'doctor'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        // doctor must have specialization - for security
        if (role === 'doctor' && (!specialization || !specialization.trim())) {
            return res.status(400).json({ message: 'Specialization is required for doctors' });
        }

        // verify if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'The user already exists' });
        }

        // create new user
        const user = await User.create({
            name,
            email,
            password,
            role,
            specialization,
            address,
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: "User created successfully!"
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
            message: 'Login successful!'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};