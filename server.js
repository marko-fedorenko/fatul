const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRouter = require('./server/auth');
const gscService = require('./server/gsc_service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    const credsJson = req.cookies.gsc_credentials;
    if (!credsJson) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        req.credentials = JSON.parse(credsJson);
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
};

// API Routes
app.get('/api/sites', requireAuth, async (req, res) => {
    try {
        const sites = await gscService.getSites(req.credentials);
        res.json(sites);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/data', requireAuth, async (req, res) => {
    const { site_url, page_filter } = req.query;
    try {
        const data = await gscService.getAnalytics(req.credentials, site_url, page_filter);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/urls', requireAuth, async (req, res) => {
    const { site_url, page_filter } = req.query;
    try {
        const data = await gscService.getUrlsAnalytics(req.credentials, site_url, page_filter);
        res.json(data);
    } catch (error) {
        console.error('Error fetching urls:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/url-timeseries', requireAuth, async (req, res) => {
    const { site_url, page_url } = req.query;
    try {
        const data = await gscService.getUrlTimeSeries(req.credentials, site_url, page_url);
        res.json(data);
    } catch (error) {
        console.error('Error fetching url time series:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production' || process.argv.includes('--serve-static')) {
    app.use(express.static(path.join(__dirname, 'frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
