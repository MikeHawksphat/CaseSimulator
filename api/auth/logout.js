// api/auth/logout.js
// Vercel Serverless Function for User Logout (Optional)

// This endpoint might not be strictly necessary if using client-side token removal,
// but can be used for server-side session invalidation if needed (e.g., blacklisting tokens).

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        // TODO: Implement server-side token invalidation if necessary
        // (e.g., add token to a blacklist in Redis or database until it expires)
        // For simple JWT, just clearing it on the client might be sufficient.

        console.log("Logout request received.");
        // For now, just acknowledge the request.
        res.status(200).json({ message: 'Logout acknowledged.' });

    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'An error occurred during logout.' });
    }
}
