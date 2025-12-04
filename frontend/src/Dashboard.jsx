import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');
    const [error, setError] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('position');
    const [siteSearch, setSiteSearch] = useState('');

    useEffect(() => {
        fetchSites();
    }, []);

    useEffect(() => {
        if (selectedSite) {
            fetchData();
        }
    }, [selectedSite]);

    // Debounce filter
    useEffect(() => {
        const timer = setTimeout(() => {
            if (selectedSite) fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [filter]);

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

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/data', {
                params: {
                    site_url: selectedSite,
                    page_filter: filter
                },
                withCredentials: true
            });
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const filteredSites = sites.filter(site =>
        site.siteUrl.toLowerCase().includes(siteSearch.toLowerCase())
    );

    const getMetricConfig = () => {
        switch (selectedMetric) {
            case 'clicks':
                return { dataKey: 'clicks', name: 'Clicks', color: '#22c55e', reversed: false };
            case 'impressions':
                return { dataKey: 'impressions', name: 'Impressions', color: '#f59e0b', reversed: false };
            default:
                return { dataKey: 'position', name: 'Avg Position', color: '#38bdf8', reversed: true };
        }
    };

    const metricConfig = getMetricConfig();

    return (
        <div>
            <div className="header">
                <h1>GSC Fresh Analytics</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={() => window.location.href = '/url-analysis'}>
                        URL Analysis
                    </button>
                    <button className="btn-primary" onClick={() => {
                        window.location.href = '/';
                    }}>Logout</button>
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
                <h3>Filter by URL</h3>
                <input
                    type="text"
                    placeholder="Filter by URL (e.g. /blog/)"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</div>
            ) : (
                <>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Dynamics (Last 10 Days)</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={data}>
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

                    <div className="card">
                        <h3>Detailed Data</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #334155' }}>
                                        <th style={{ padding: '1rem' }}>Date</th>
                                        <th style={{ padding: '1rem' }}>Clicks</th>
                                        <th style={{ padding: '1rem' }}>Impressions</th>
                                        <th style={{ padding: '1rem' }}>CTR</th>
                                        <th style={{ padding: '1rem' }}>Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row) => (
                                        <tr key={row.date} style={{ borderBottom: '1px solid #334155' }}>
                                            <td style={{ padding: '1rem' }}>{row.date}</td>
                                            <td style={{ padding: '1rem' }}>{row.clicks}</td>
                                            <td style={{ padding: '1rem' }}>{row.impressions}</td>
                                            <td style={{ padding: '1rem' }}>{(row.ctr * 100).toFixed(2)}%</td>
                                            <td style={{ padding: '1rem' }}>{row.position.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
