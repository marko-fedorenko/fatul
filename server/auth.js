const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Try to find client_secret.json
const possiblePaths = [
    path.join(__dirname, '..', 'client_secret.json'),
    path.join(__dirname, '..', 'backend', 'client_secret.json')
];

let CLIENT_SECRETS_FILE = null;
for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
        CLIENT_SECRETS_FILE = p;
        break;
    }
}

router.get('/login', (req, res) => {
    let credentials;
    if (CLIENT_SECRETS_FILE) {
        const content = fs.readFileSync(CLIENT_SECRETS_FILE);
        credentials = JSON.parse(content);
    } else if (process.env.GOOGLE_CREDENTIALS) {
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } else {
        return res.status(500).json({ error: "Credentials not found. Set GOOGLE_CREDENTIALS env var or add client_secret.json" });
    }

    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        `${BACKEND_URL}/api/auth/callback`
    );

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        include_granted_scopes: true
    });

    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;

    let credentials;
    try {
        if (CLIENT_SECRETS_FILE) {
            const content = fs.readFileSync(CLIENT_SECRETS_FILE);
            credentials = JSON.parse(content);
        } else if (process.env.GOOGLE_CREDENTIALS) {
            credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } else {
            return res.status(500).json({ error: "Credentials not found." });
        }

        const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            `${BACKEND_URL}/api/auth/callback`
        );

        const { tokens } = await oAuth2Client.getToken(code);

        // Combine tokens with client secrets to store full credentials
        const fullCredentials = {
            ...credentials,
            tokens
        };

        res.cookie('gsc_credentials', JSON.stringify(fullCredentials), {
            maxAge: 3600 * 1000,
            httpOnly: true,
            path: '/'
        });

        // Also set a non-httpOnly cookie for the frontend to know we are logged in (optional, but useful)
        // Or just redirect and let frontend try to fetch data

        res.redirect(`${FRONTEND_URL}/dashboard`);
    } catch (error) {
        console.error('Error in callback:', error);
        res.status(500).send('Authentication failed');
    }
});

module.exports = router;
