// This isn't a direct endpoint, but a utility function you'd use in data endpoints
// You could place this in a `utils/auth.js` file or potentially use Vercel Middleware

import jwt from 'jsonwebtoken';

// --- IMPORTANT: JWT Secret ---
// TODO: Use Environment Variable on Vercel
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_FALLBACK_SECRET_KEY_HERE';

/**
 * Verifies the JWT token from the Authorization header.
 * @param {object} req - The incoming request object.
 * @returns {object | null} The decoded user payload if valid, otherwise null.
 */
export function verifyToken(req) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Auth verification failed: No Bearer token found.");
        return null; // No token provided
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        // decoded will contain the payload (e.g., { userId: '...', email: '...', iat: ..., exp: ... })
        console.log("Auth verification successful for user:", decoded.userId);
        return decoded; // Return the payload (contains userId, email)
    } catch (error) {
        // Token is invalid (expired, wrong signature, etc.)
        console.error('Auth verification failed: Invalid token.', error.message);
        return null;
    }
}

// Example Usage in another API route (e.g., api/data/load.js):
/*
import { verifyToken } from '../../utils/auth'; // Adjust path

export default async function handler(req, res) {
    const userData = verifyToken(req);

    if (!userData) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    // Now you can use userData.userId to fetch data for the authenticated user
    const userId = userData.userId;
    // ... proceed to fetch data for userId ...
}
*/
