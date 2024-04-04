import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  // Get token from request headers
  const token = req.header('Authorization');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user data from token to request object
    req.user = decoded;

    // Move to next middleware
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to verify if user is superadmin
export const verifySuperadmin = (req, res, next) => {
  // Check if user is superadmin based on data in JWT token
  if (req.user && req.user.isSuperadmin) {
    // User is superadmin, move to next middleware
    next();
  } else {
    // User is not superadmin, return unauthorized error
    res.status(403).json({ message: 'Unauthorized access. Superadmin privileges required' });
  }
};
