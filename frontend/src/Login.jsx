import React from 'react';

const Login = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:8000/auth/login';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '2rem' }}>GSC Fresh Analytics</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Connect your Google Search Console account to view fresh ranking dynamics.
                </p>
                <button className="btn-primary" onClick={handleLogin} style={{ width: '100%' }}>
                    Connect with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
