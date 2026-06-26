import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.fitforge_token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.id).select('-password').then((user) => {
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        status: user.status,
        name: user.name,
        photoURL: user.photoURL,
      };
      next();
    }).catch(() => res.status(401).json({ message: 'Invalid or expired token' }));
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireActiveUser = (req, res, next) => {
  if (req.user?.status === 'blocked') {
    return res.status(403).json({ message: 'Action restricted by Admin' });
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    next();
  };
};
