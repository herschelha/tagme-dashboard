import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentPage, setCurrentPage] = useState('login');
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [visitors, setVisitors] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch dashboard data
useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, currentPage, fetchDashboardData]);

  const fetchDashboardData = async () => {
    try {
      const endpoint = user?.role === 'admin' 
        ? `${API_URL}/api/admin/dashboard`
        : `${API_URL}/api/customer/dashboard`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardData(data);

      if (currentPage === 'analytics') {
        fetchAnalytics();
      }
      if (currentPage === 'visitors') {
        fetchVisitors();
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/visitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch(`${API_URL}/api/visitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVisitors(data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    }
  };

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
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Render pages based on currentPage
  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">📱 TagMe</div>
              <div className="text-sm text-gray-600">by Hash3D</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-t border-gray-200">
            {user?.role === 'admin' ? (
              <>
                <TabButton 
                  label="👥 Customers" 
                  active={currentPage === 'admin-dashboard'}
                  onClick={() => setCurrentPage('admin-dashboard')}
                />
                <TabButton 
                  label="📊 Analytics" 
                  active={currentPage === 'analytics'}
                  onClick={() => setCurrentPage('analytics')}
                />
              </>
            ) : (
              <>
                <TabButton 
                  label="📊 Dashboard" 
                  active={currentPage === 'dashboard'}
                  onClick={() => setCurrentPage('dashboard')}
                />
                <TabButton 
                  label="👥 Visitors" 
                  active={currentPage === 'visitors'}
                  onClick={() => setCurrentPage('visitors')}
                />
                <TabButton 
                  label="📈 Analytics" 
                  active={currentPage === 'analytics'}
                  onClick={() => setCurrentPage('analytics')}
                />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user?.role === 'admin' && currentPage === 'admin-dashboard' && (
          <AdminDashboard data={dashboardData} onRefresh={fetchDashboardData} />
        )}
        
        {user?.role === 'customer' && currentPage === 'dashboard' && (
          <CustomerDashboard data={dashboardData} />
        )}
        
        {currentPage === 'analytics' && (
          <AnalyticsPage data={analyticsData} />
        )}
        
        {currentPage === 'visitors' && (
          <VisitorsPage data={visitors} />
        )}
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-4 font-medium text-sm border-b-2 transition ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-800'
      }`}
    >
      {label}
    </button>
  );
}

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('herschelismail@gmail.com');
  const [password, setPassword] = useState('H@sH5281');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">📱 TagMe</div>
          <div className="text-gray-600">by Hash3D</div>
          <p className="text-sm text-gray-500 mt-2">Professional Contact Sharing Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <strong>Demo Credentials:</strong><br />
          Owner: herschelismail@gmail.com<br />
          Password: H@sH5281<br />
          <br />
          <strong>Try these too:</strong><br />
          john.smith@company.com<br />
          mike.wilson@company.com
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data, onRefresh }) {
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">👥 Customer Management</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={data.totalCustomers}
          icon="👥"
          color="blue"
        />
        <MetricCard
          title="Total Scans"
          value={data.totalScans}
          icon="📱"
          color="green"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`R${data.monthRevenue}`}
          icon="💰"
          color="purple"
        />
        <MetricCard
          title="This Month Scans"
          value={data.monthScans}
          icon="📈"
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly Scan Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Subscription Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Customers Table */}
      <Card title="All Customers">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Revenue</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Scans</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.customers?.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.full_name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      customer.tier === 'premium' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {customer.tier?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">R{customer.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{customer.total_scans}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CustomerDashboard({ data }) {
  if (!data) return <LoadingSpinner />;

  const stats = data.stats || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📊 Your Dashboard</h1>

      {/* Profile Card */}
      <Card title="Your Profile">
        <div className="space-y-2">
          <p><strong>Name:</strong> {data.user?.full_name}</p>
          <p><strong>Email:</strong> {data.user?.email}</p>
          <p><strong>Plan:</strong> <span className="font-medium">{data.subscription?.tier?.toUpperCase() || 'No plan'}</span></p>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Scans"
          value={stats.totalScans || 0}
          icon="📱"
          color="blue"
        />
        <MetricCard
          title="This Month"
          value={stats.scansThisMonth || 0}
          icon="📅"
          color="green"
        />
        <MetricCard
          title="This Week"
          value={stats.scansThisWeek || 0}
          icon="📈"
          color="purple"
        />
        <MetricCard
          title="New Visitors"
          value={stats.newVisitors || 0}
          icon="👥"
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton icon="📥" label="Download Contacts" />
          <ActionButton icon="🔗" label="Share Profile" />
          <ActionButton icon="⚙️" label="Settings" />
        </div>
      </Card>
    </div>
  );
}

function AnalyticsPage({ data }) {
  const chartData = [
    { date: '2024-01-01', scans: 12 },
    { date: '2024-01-02', scans: 15 },
    { date: '2024-01-03', scans: 18 },
    { date: '2024-01-04', scans: 22 },
    { date: '2024-01-05', scans: 25 },
    { date: '2024-01-06', scans: 28 },
    { date: '2024-01-07', scans: 32 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📈 Analytics</h1>

      <Card title="Daily Scans Trend">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="scans" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Growth Metrics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">↑ 23%</div>
            <p className="text-gray-600 text-sm mt-2">Week over week growth</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">→ 224</div>
            <p className="text-gray-600 text-sm mt-2">Average scans per week</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">↑ 15</div>
            <p className="text-gray-600 text-sm mt-2">New contacts this week</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function VisitorsPage({ data }) {
  if (!data) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">👥 Your Visitors</h1>

      <Card title="Contact List">
        <div className="space-y-2">
          {data.map((visitor, idx) => (
            <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-900">{visitor.name}</p>
                  <p className="text-sm text-gray-600">{visitor.email}</p>
                  <p className="text-sm text-gray-600">{visitor.company}</p>
                </div>
                <button className="text-blue-600 hover:underline text-sm">Export</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Export Options">
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            📥 Download CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            📧 Email Contacts
          </button>
        </div>
      </Card>
    </div>
  );
}

// ==================== UTILITY COMPONENTS ====================

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>}
      {children}
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`text-4xl p-4 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </Card>
  );
}

function ActionButton({ icon, label }) {
  return (
    <button className="p-4 border rounded-lg hover:bg-gray-50 transition text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </button>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
