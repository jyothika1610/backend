const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware to protect routes and extract user info from JWT.
 */
exports.protect = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user info to request object
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

/**
 * Middleware to restrict access to Admin users only.
 */
exports.adminOnly = (req, res, next) => {
    // Check if the user role (attached by protect middleware) is 'admin'
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
};

/**
 * Middleware to restrict access to Citizen users only.
 */
exports.citizenOnly = (req, res, next) => {
    // Check if the user role (attached by protect middleware) is 'citizen'
    if (req.user && req.user.role === 'citizen') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Citizen privileges required.' });
    }
};