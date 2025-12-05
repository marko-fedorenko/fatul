const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly'];

function getAuth(credentials) {
    const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris ? redirect_uris[0] : undefined
    );

    if (credentials.tokens) {
        oAuth2Client.setCredentials(credentials.tokens);
    }
    return oAuth2Client;
}

function getService(credentials) {
    const auth = getAuth(credentials);
    return google.webmasters({ version: 'v3', auth });
}

async function getSites(credentials) {
    const service = getService(credentials);
    const res = await service.sites.list();
    return res.data.siteEntry || [];
}

async function getAnalytics(credentials, siteUrl, pageFilter = null) {
    const service = getService(credentials);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 10);

    const request = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date'],
        rowLimit: 25000,
        dataState: 'all'
    };

    if (pageFilter) {
        request.dimensionFilterGroups = [{
            filters: [{
                dimension: 'page',
                operator: 'contains',
                expression: pageFilter
            }]
        }];
    }

    const res = await service.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: request
    });

    const rows = res.data.rows || [];

    const data = rows.map(row => ({
        date: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
    }));

    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    return data;
}

async function getUrlsAnalytics(credentials, siteUrl, pageFilter = null) {
    const service = getService(credentials);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 10);

    const request = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['page'],
        rowLimit: 25000,
        dataState: 'all'
    };

    if (pageFilter) {
        request.dimensionFilterGroups = [{
            filters: [{
                dimension: 'page',
                operator: 'contains',
                expression: pageFilter
            }]
        }];
    }

    const res = await service.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: request
    });

    const rows = res.data.rows || [];

    const data = rows.map(row => ({
        url: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
    }));

    // Sort by clicks descending
    data.sort((a, b) => b.clicks - a.clicks);

    return data;
}

async function getUrlTimeSeries(credentials, siteUrl, pageUrl) {
    const service = getService(credentials);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 10);

    const request = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['date'],
        dimensionFilterGroups: [{
            filters: [{
                dimension: 'page',
                operator: 'equals',
                expression: pageUrl
            }]
        }],
        rowLimit: 25000,
        dataState: 'all'
    };

    const res = await service.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: request
    });

    const rows = res.data.rows || [];

    const data = rows.map(row => ({
        date: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
    }));

    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    return data;
}

module.exports = {
    getSites,
    getAnalytics,
    getUrlsAnalytics,
    getUrlTimeSeries
};
