// api/data/save.js
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
    try { return jwt.verify(token, JWT_SECRET); } catch (error) { console.error('Token verification failed:', error.message); return null; }
}
// ---

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

     if (!process.env.KV_URL) {
         console.error("KV environment variables not found.");
         return res.status(500).json({ message: 'Server configuration error [KV].' });
    }

    // Verify User Authentication
    const userPayload = verifyToken(req);
    if (!userPayload || !userPayload.userId) {
         console.log("Data save failed: Unauthorized access attempt.");
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const userId = userPayload.userId;
    const dataKey = `data:${userId}`; // Key for game data
    console.log(`Data save request for user: ${userId} (key: ${dataKey})`);

    try {
        const { inventory, totalCasesOpened } = req.body;

        // Basic Input Validation
        if (!Array.isArray(inventory) || typeof totalCasesOpened !== 'number') {
            console.log(`Invalid data format received for user ${userId}:`, req.body);
            return res.status(400).json({ message: 'Invalid data format provided.' });
        }

        // --- Prepare data object to save ---
        const dataToSave = {
            inventory: inventory,
            totalCasesOpened: totalCasesOpened,
            userId: userId, // Include userId for reference
            updatedAt: new Date().toISOString(), // Track last update time
        };

        // --- Save data to Vercel KV ---
        // Use set to overwrite the existing data for this user
        await kv.set(dataKey, JSON.stringify(dataToSave));

        console.log(`Data saved successfully for user ${userId}. Inventory items: ${inventory.length}, Cases: ${totalCasesOpened}`);

        // --- Success Response ---
        // 204 No Content is appropriate as we don't need to send data back
        res.status(204).end();

    } catch (error) {
        console.error(`Data Save Error for user ${userId} (key: ${dataKey}):`, error);
        res.status(500).json({ message: 'An error occurred while saving your data.' });
    }
}
