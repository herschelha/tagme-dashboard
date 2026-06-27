/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('login');
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [visitors, setVisitors] = useState(null);

  const API_URL = 'https://tap-share-connect-production.up.railway.app';

  const fetchDashboardData = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const endpoint = storedUser.role === 'admin'
        ? `${API_URL}/api/admin/dashboard`
        : `${API_URL}/api/customer/dashboard`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, [token, API_URL]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/visitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [token, API_URL]);

  const fetchVisitors = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/visitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVisitors(data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    }
  }, [token, API_URL]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      if (currentPage === 'analytics') fetchAnalytics();
      if (currentPage === 'visitors') fetchVisitors();
    }
  }, [token, currentPage, fetchDashboardData, fetchAnalytics, fetchVisitors]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setCurrentPage(parsedUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentPage(data.user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
      } else {
        alert('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Cannot connect to server. Please try again.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setDashboardData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* Navigation */}
      <nav style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>📱 TagMe</span>
            <span style={{ fontSize: 14, color: '#6b7280' }}>by Hash3D</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 14, color: '#374151' }}>{user?.fullName}</span>
            <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 8, borderTop: '1px solid #e5e7eb' }}>
          {user?.role === 'admin' ? (
            <>
              <TabButton label="👥 Customers" active={currentPage === 'admin-dashboard'} onClick={() => setCurrentPage('admin-dashboard')} />
              <TabButton label="📊 Analytics" active={currentPage === 'analytics'} onClick={() => setCurrentPage('analytics')} />
            </>
          ) : (
            <>
              <TabButton label="📊 Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
              <TabButton label="👥 Visitors" active={currentPage === 'visitors'} onClick={() => setCurrentPage('visitors')} />
              <TabButton label="📈 Analytics" active={currentPage === 'analytics'} onClick={() => setCurrentPage('analytics')} />
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {user?.role === 'admin' && currentPage === 'admin-dashboard' && <AdminDashboard data={dashboardData} />}
        {user?.role === 'customer' && currentPage === 'dashboard' && <CustomerDashboard data={dashboardData} />}
        {currentPage === 'analytics' && <AnalyticsPage data={analyticsData} />}
        {currentPage === 'visitors' && <VisitorsPage data={visitors} />}
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '16px',
      fontWeight: 600,
      fontSize: 14,
      border: 'none',
      borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
      color: active ? '#3b82f6' : '#6b7280',
      background: 'transparent',
      cursor: 'pointer'
    }}>
      {label}
    </button>
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('herschelismail@gmail.com');
  const [password, setPassword] = useState('H@sH5281');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', padding: 40, width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>📱 TagMe</div>
          <div style={{ color: '#6b7280', fontSize: 14 }}>by Hash3D</div>
          <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 8 }}>Professional Contact Sharing Dashboard</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: '#eff6ff', borderRadius: 8, fontSize: 13, color: '#374151' }}>
          <strong>Demo Credentials:</strong><br />
          Owner: herschelismail@gmail.com<br />
          Password: H@sH5281<br /><br />
          <strong>Try these too:</strong><br />
          john.smith@company.com<br />
          mike.wilson@company.com
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }) {
  if (!data) return <LoadingSpinner />;

  const chartData = [
    { name: 'Week 1', scans: 45 },
    { name: 'Week 2', scans: 52 },
    { name: 'Week 3', scans: 48 },
    { name: 'Week 4', scans: 67 },
  ];

  const pieData = [
    { name: 'Premium', value: 3, fill: '#3b82f6' },
    { name: 'Basic', value: 2, fill: '#10b981' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>👥 Customer Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard title="Total Customers" value={data.totalCustomers || 0} icon="👥" color="#3b82f6" />
        <MetricCard title="Total Scans" value={data.totalScans || 0} icon="📱" color="#10b981" />
        <MetricCard title="Monthly Revenue" value={`R${data.monthRevenue || 0}`} icon="💰" color="#8b5cf6" />
        <MetricCard title="This Month Scans" value={data.monthScans || 0} icon="📈" color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <Card title="Weekly Scan Trend">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="scans" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Subscription Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="All Customers">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Plan</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Revenue</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Scans</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.customers?.map((customer) => (
              <tr key={customer.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{customer.full_name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: customer.tier === 'premium' ? '#ede9fe' : '#d1fae5', color: customer.tier === 'premium' ? '#7c3aed' : '#065f46' }}>
                    {customer.tier?.toUpperCase() || 'N/A'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>R{customer.price}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{customer.total_scans}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: '#d1fae5', color: '#065f46' }}>Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function CustomerDashboard({ data }) {
  if (!data) return <LoadingSpinner />;
  const stats = data.stats || {};

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>📊 Your Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard title="Total Scans" value={stats.totalScans || 0} icon="📱" color="#3b82f6" />
        <MetricCard title="This Month" value={stats.scansThisMonth || 0} icon="📅" color="#10b981" />
        <MetricCard title="This Week" value={stats.scansThisWeek || 0} icon="📈" color="#8b5cf6" />
        <MetricCard title="New Visitors" value={stats.newVisitors || 0} icon="👥" color="#f59e0b" />
      </div>

      <Card title="Your Profile">
        <p><strong>Name:</strong> {data.user?.full_name}</p>
        <p style={{ marginTop: 8 }}><strong>Email:</strong> {data.user?.email}</p>
        <p style={{ marginTop: 8 }}><strong>Plan:</strong> {data.subscription?.tier?.toUpperCase() || 'No plan'}</p>
      </Card>
    </div>
  );
}

function AnalyticsPage() {
  const chartData = [
    { date: 'Mon', scans: 12 },
    { date: 'Tue', scans: 15 },
    { date: 'Wed', scans: 18 },
    { date: 'Thu', scans: 22 },
    { date: 'Fri', scans: 25 },
    { date: 'Sat', scans: 28 },
    { date: 'Sun', scans: 32 },
  ];

  const weeklyData = [
    { name: 'Week 1', scans: 45 },
    { name: 'Week 2', scans: 52 },
    { name: 'Week 3', scans: 48 },
    { name: 'Week 4', scans: 67 },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>📈 Analytics</h1>

      <Card title="Daily Scans This Week">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="scans" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card title="Weekly Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}>↑ 23%</div>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Week over week growth</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6' }}>224</div>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>Average scans per week</p>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#8b5cf6' }}>↑ 15</div>
            <p style={{ color: '#6b7280', fontSize: 13, marginTop: 8 }}>New contacts this week</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function VisitorsPage({ data }) {
  if (!data) return <LoadingSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', marginBottom: 24 }}>👥 Your Visitors</h1>

      <Card title={`Contact List (${data.length} total)`}>
        {data.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: 32 }}>No visitors yet. Start sharing your NFC tag!</p>
        ) : (
          data.map((visitor, idx) => (
            <div key={idx} style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600, color: '#1f2937' }}>{visitor.name}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{visitor.email}</p>
                <p style={{ fontSize: 13, color: '#6b7280' }}>{visitor.company}</p>
              </div>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(visitor.created_at).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card title="Export Options">
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              📥 Download CSV
            </button>
            <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
              📧 Email Contacts
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: 24 }}>
      {title && <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 16 }}>{title}</h2>}
      {children}
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{value}</p>
      </div>
      <div style={{ fontSize: 32, padding: 16, background: `${color}20`, borderRadius: 12 }}>{icon}</div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
      <div style={{ fontSize: 18, color: '#6b7280' }}>Loading...</div>
    </div>
  );
}
