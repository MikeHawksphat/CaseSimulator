// api/auth/login.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { kv } from '@vercel/kv';

// --- Environment Variables ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

     if (!process.env.KV_URL) {
         console.error("KV environment variables not found.");
         return res.status(500).json({ message: 'Server configuration error [KV].' });
    }

    try {
        const { email, password } = req.body;
        const lowerCaseEmail = email?.toLowerCase();

        // Basic Input Validation
        if (!lowerCaseEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // --- Find user by email key in Vercel KV ---
        const userKey = `user:${lowerCaseEmail}`;
        console.log(`Login attempt for key: ${userKey}`);
        const userDataString = await kv.get(userKey);

        if (!userDataString) {
            console.log(`Login failed: User key not found for ${userKey}`);
            return res.status(401).json({ message: 'Invalid email or password.' }); // Unauthorized
        }

        // Parse the user data
        const user = JSON.parse(userDataString);

        // --- Compare Passwords ---
        const isMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!isMatch) {
            console.log(`Login failed: Password mismatch for ${lowerCaseEmail}`);
            return res.status(401).json({ message: 'Invalid email or password.' }); // Unauthorized
        }

        // --- Generate JWT Token ---
        // Use the userId stored within the user object from KV
        const userPayload = { userId: user.userId, email: user.email };
        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });
        console.log(`Login successful, JWT generated for: ${lowerCaseEmail}`);

        // --- Success Response ---
        res.status(200).json({
            message: 'Login successful!',
            user: { email: user.email }, // Don't send password back
            token: token
        });

    } catch (error) {
        console.error('Login Error:', error);
        if (error instanceof SyntaxError) { // Handle potential JSON parsing errors
             console.error("Error parsing user data from KV.");
             return res.status(500).json({ message: 'Error retrieving user data.' });
        }
        res.status(500).json({ message: 'An error occurred during login.' });
    }
}
