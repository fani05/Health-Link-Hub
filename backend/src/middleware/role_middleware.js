export const doctorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'doctor') {
        next();
    } else {
        res.status(403).json({ message: 'Access allowed only for doctors' });
    }
};

export const patientOnly = (req, res, next) => {
    if (req.user && req.user.role === 'patient') {
        next();
    } else {
        res.status(403).json({ message: 'Access allowed only for patients' });
    }
};