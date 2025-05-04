// api/auth/signup.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Import the Vercel KV client
import { kv } from '@vercel/kv';

// --- Environment Variables ---
// Ensure JWT_SECRET is set in your Vercel project environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
}
// Vercel KV connection details are automatically picked up from environment variables
// (KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN)
// when deployed on Vercel.

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
        const lowerCaseEmail = email?.toLowerCase(); // Ensure email is processed

        // Basic Input Validation
        if (!lowerCaseEmail || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        if (password.length < 6) {
             return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }
        // Basic email format check (consider a more robust library for production)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerCaseEmail)) {
             return res.status(400).json({ message: 'Invalid email format.' });
        }


        // --- Check if user exists in Vercel KV ---
        // We store user core info under a key like 'user:email@example.com'
        const userKey = `user:${lowerCaseEmail}`;
        console.log(`Signup attempt for key: ${userKey}`);
        const existingUser = await kv.get(userKey);

        if (existingUser) {
            console.log(`Signup failed: Key ${userKey} already exists.`);
            return res.status(409).json({ message: 'Email already registered.' }); // 409 Conflict
        }

        // --- Hash Password ---
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log(`Password hashed for: ${lowerCaseEmail}`);

        // --- Create new user object ---
        // Generate a unique user ID (could use UUID library in production)
        const userId = `uid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newUser = {
            userId: userId, // Store the generated ID
            email: lowerCaseEmail,
            hashedPassword: hashedPassword,
            createdAt: new Date().toISOString(),
        };

        // --- Store new user in Vercel KV ---
        // Set the user data using the email-based key
        await kv.set(userKey, JSON.stringify(newUser));
        // Optionally, set another key mapping userId back to email if needed for other lookups
        // await kv.set(`userid:${userId}`, lowerCaseEmail);
        console.log(`User stored in KV with key: ${userKey}`);

        // --- Create initial game data in Vercel KV ---
        // Store game data under a key like 'data:uid_...'
        const dataKey = `data:${userId}`;
        const initialData = {
            inventory: [],
            totalCasesOpened: 0,
            userId: userId, // Link back to user
            updatedAt: new Date().toISOString(),
        };
        await kv.set(dataKey, JSON.stringify(initialData));
        console.log(`Initial game data stored in KV with key: ${dataKey}`);


        // --- Generate JWT Token ---
        const userPayload = { userId: userId, email: newUser.email };
        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1d' });
        console.log(`JWT generated for: ${lowerCaseEmail}`);

        // --- Success Response ---
        res.status(201).json({
            message: 'Signup successful!',
            user: { email: newUser.email }, // Don't send password back!
            token: token
        });

    } catch (error) {
        console.error('Signup Error:', error);
        // Check for specific KV errors if needed
        res.status(500).json({ message: 'An error occurred during signup.' });
    }
}
