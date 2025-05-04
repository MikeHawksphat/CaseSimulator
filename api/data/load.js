// api/data/load.js
import jwt from 'jsonwebtoken';
import { kv } from '@vercel/kv';

// --- Environment Variables ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set.');
}

// --- Auth Verification Helper ---
function verifyToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        // Verify token and return payload (e.g., { userId: '...', email: '...' })
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return null;
    }
}
// ---

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

     if (!process.env.KV_URL) {
         console.error("KV environment variables not found.");
         return res.status(500).json({ message: 'Server configuration error [KV].' });
    }

    // Verify User Authentication
    const userPayload = verifyToken(req);
    if (!userPayload || !userPayload.userId) {
        console.log("Data load failed: Unauthorized access attempt.");
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const userId = userPayload.userId;
    const dataKey = `data:${userId}`; // Key for game data
    console.log(`Data load request for user: ${userId} (key: ${dataKey})`);

    try {
        // --- Fetch user game data from Vercel KV ---
        const dataString = await kv.get(dataKey);

        if (!dataString) {
            // This might happen if initial data creation failed during signup,
            // or if data was somehow deleted. Return default empty state.
            console.log(`No data found for key ${dataKey}, returning defaults.`);
            return res.status(200).json({
                inventory: [],
                totalCasesOpened: 0
            });
        }

        // Parse the game data
        const gameData = JSON.parse(dataString);

        // --- Success Response ---
        console.log(`Data loaded successfully for user: ${userId}`);
        res.status(200).json({
            // Ensure expected fields exist, provide defaults if not
            inventory: gameData.inventory || [],
            totalCasesOpened: gameData.totalCasesOpened || 0
        });

    } catch (error) {
        console.error(`Data Load Error for user ${userId} (key: ${dataKey}):`, error);
         if (error instanceof SyntaxError) {
             console.error("Error parsing game data from KV.");
             return res.status(500).json({ message: 'Error retrieving saved data format.' });
        }
        res.status(500).json({ message: 'An error occurred while loading your data.' });
    }
}
