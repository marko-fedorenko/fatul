import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const UrlAnalysis = () => {
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState('');
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [siteSearch, setSiteSearch] = useState('');
    const [urlFilter, setUrlFilter] = useState('');
    const [selectedUrl, setSelectedUrl] = useState(null);
    const [urlTimeSeries, setUrlTimeSeries] = useState([]);
    const [selectedMetric, setSelectedMetric] = useState('clicks');

    useEffect(() => {
        fetchSites();
    }, []);

    useEffect(() => {
        if (selectedSite) {
            fetchUrls();
        }
    }, [selectedSite]);

    // Debounce URL filter
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedSite) fetchUrls();
        }, 500);
        return () => clearTimeout(timer);
    }, [urlFilter]);

    const fetchSites = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/sites', { withCredentials: true });
            setSites(response.data);
            if (response.data.length > 0) {
                setSelectedSite(response.data[0].siteUrl);
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                window.location.href = '/';
            }
            setError('Failed to fetch sites');
        }
    };

    const fetchUrls = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/urls', {
                params: {
                    site_url: selectedSite,
                    page_filter: urlFilter || undefined
                },
                withCredentials: true
            });
            setUrls(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch URLs');
        } finally {
            setLoading(false);
        }
    };

    const fetchUrlTimeSeries = async (url) => {
        try {
            const response = await axios.get('http://localhost:8000/api/url-timeseries', {
                params: {
                    site_url: selectedSite,
                    page_url: url
                },
                withCredentials: true
            });
            setUrlTimeSeries(response.data);
            setSelectedUrl(url);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch URL time series');
        }
    };

    const filteredSites = sites.filter(site =>
        site.siteUrl.toLowerCase().includes(siteSearch.toLowerCase())
    );

    const getMetricConfig = () => {
        switch (selectedMetric) {
            case 'impressions':
                return { dataKey: 'impressions', name: 'Impressions', color: '#f59e0b', reversed: false };
            case 'position':
                return { dataKey: 'position', name: 'Avg Position', color: '#38bdf8', reversed: true };
            default:
                return { dataKey: 'clicks', name: 'Clicks', color: '#22c55e', reversed: false };
        }
    };

    const metricConfig = getMetricConfig();

    return (
        <div>
            <div className="header">
                <h1>URL Analysis</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => window.location.href = '/dashboard'}>
                        Back to Dashboard
                    </button>
                    <button className="btn-primary" onClick={() => window.location.href = '/'}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Select Website</h3>
                <input
                    type="text"
                    placeholder="Search websites..."
                    value={siteSearch}
                    onChange={(e) => setSiteSearch(e.target.value)}
                    style={{ marginBottom: '1rem' }}
                />
                <select
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    style={{ width: '100%' }}
                >
                    {filteredSites.map((site) => (
                        <option key={site.siteUrl} value={site.siteUrl}>
                            {site.siteUrl}
                        </option>
                    ))}
                </select>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3>Filter URLs</h3>
                <input
                    type="text"
                    placeholder="Filter URLs (e.g. /blog/)"
                    value={urlFilter}
                    onChange={(e) => setUrlFilter(e.target.value)}
                />
            </div>

            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

            {selectedUrl && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                            <h3>URL: {selectedUrl}</h3>
                            <button
                                onClick={() => setSelectedUrl(null)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    marginTop: '0.5rem',
                                    backgroundColor: 'var(--card-bg)',
                                    color: 'var(--text-primary)',
                                    border: `1px solid var(--border)`
                                }}
                            >
                                Close
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className={selectedMetric === 'clicks' ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setSelectedMetric('clicks')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: selectedMetric === 'clicks' ? 'var(--accent)' : 'var(--card-bg)',
                                    color: selectedMetric === 'clicks' ? '#0f172a' : 'var(--text-primary)',
                                    border: `1px solid ${selectedMetric === 'clicks' ? 'var(--accent)' : 'var(--border)'}`
                                }}
                            >
                                Clicks
                            </button>
                            <button
                                className={selectedMetric === 'impressions' ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setSelectedMetric('impressions')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: selectedMetric === 'impressions' ? 'var(--accent)' : 'var(--card-bg)',
                                    color: selectedMetric === 'impressions' ? '#0f172a' : 'var(--text-primary)',
                                    border: `1px solid ${selectedMetric === 'impressions' ? 'var(--accent)' : 'var(--border)'}`
                                }}
                            >
                                Impressions
                            </button>
                            <button
                                className={selectedMetric === 'position' ? 'btn-primary' : 'btn-secondary'}
                                onClick={() => setSelectedMetric('position')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: selectedMetric === 'position' ? 'var(--accent)' : 'var(--card-bg)',
                                    color: selectedMetric === 'position' ? '#0f172a' : 'var(--text-primary)',
                                    border: `1px solid ${selectedMetric === 'position' ? 'var(--accent)' : 'var(--border)'}`
                                }}
                            >
                                Position
                            </button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={urlTimeSeries}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis reversed={metricConfig.reversed} stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                itemStyle={{ color: '#f8fafc' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey={metricConfig.dataKey}
                                stroke={metricConfig.color}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 8 }}
                                name={metricConfig.name}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading URLs...</div>
            ) : (
                <div className="card">
                    <h3>URLs by Traffic ({urls.length} URLs)</h3>
                    <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1 }}>
                                <tr style={{ borderBottom: '2px solid #334155' }}>
                                    <th style={{ padding: '1rem' }}>URL</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Clicks</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Impressions</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>CTR</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Position</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urls.map((row, index) => (
                                    <tr
                                        key={index}
                                        onClick={() => fetchUrlTimeSeries(row.url)}
                                        style={{
                                            borderBottom: '1px solid #334155',
                                            cursor: 'pointer',
                                            backgroundColor: selectedUrl === row.url ? 'var(--bg-color)' : 'transparent'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedUrl === row.url ? 'var(--bg-color)' : 'transparent'}
                                    >
                                        <td style={{ padding: '1rem', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {row.url}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#22c55e' }}>{row.clicks}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{row.impressions}</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{(row.ctr * 100).toFixed(2)}%</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{row.position.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UrlAnalysis;
