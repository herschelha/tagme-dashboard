/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const API = 'https://tap-share-connect-production.up.railway.app';

// ─── VISITOR DETAIL MODAL ────────────────────────────────────────────────────
function VisitorDetailModal({ visitor, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!visitor) return null;

  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${visitor.name}\nTEL:${visitor.phone||''}\nEMAIL:${visitor.email||''}\nORG:${visitor.company||''}\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${visitor.name}.vcf`;
    a.click(); URL.revokeObjectURL(url);
  };

  const copyInfo = () => {
    navigator.clipboard.writeText([visitor.name, visitor.company, visitor.phone, visitor.email].filter(Boolean).join('\n'));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:16,padding:28,width:'90%',maxWidth:440,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h2 style={{margin:0,fontSize:20,color:'#1f2937'}}>{visitor.name}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#6b7280'}}>✕</button>
        </div>
        {[['📧 Email', visitor.email],['📞 Phone', visitor.phone],['🏢 Company', visitor.company],['📅 Tapped', new Date(visitor.created_at).toLocaleString()]].map(([label,val])=>val?(
          <div key={label} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
            <span style={{color:'#6b7280',minWidth:90,fontSize:14}}>{label}</span>
            <span style={{color:'#1f2937',fontWeight:600,fontSize:14}}>{val}</span>
          </div>
        ):null)}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:20}}>
          <button onClick={downloadVCard} style={{padding:12,background:'#3b82f6',color:'white',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}}>📲 Save Contact</button>
          <button onClick={copyInfo} style={{padding:12,background:copied?'#f0fdf4':'#f3f4f6',border:'1px solid',borderColor:copied?'#bbf7d0':'#e5e7eb',borderRadius:10,fontWeight:700,cursor:'pointer'}}>{copied?'✅ Copied!':'📋 Copy'}</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}}>
          {visitor.email&&<a href={`mailto:${visitor.email}`} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:10,background:'#eff6ff',borderRadius:10,color:'#2563eb',fontWeight:600,fontSize:13,textDecoration:'none'}}>✉️ Email</a>}
          {visitor.phone&&<a href={`https://wa.me/${visitor.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:10,background:'#f0fdf4',borderRadius:10,color:'#16a34a',fontWeight:600,fontSize:13,textDecoration:'none'}}>💬 WhatsApp</a>}
        </div>
        <button onClick={onClose} style={{width:'100%',marginTop:12,padding:10,background:'transparent',border:'1px solid #e5e7eb',borderRadius:10,color:'#6b7280',fontWeight:600,cursor:'pointer'}}>Close</button>
      </div>
    </div>
  );
}

// ─── VISITORS TABLE MODAL ─────────────────────────────────────────────────────
function VisitorsModal({ title, endpoint, onSelect, onClose }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 25;

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `${API}${endpoint}?limit=${limit}&offset=${page * limit}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setVisitors(data.visitors || data.contacts || []);
      setTotal(data.total || data.count || 0);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:16,width:'95%',maxWidth:900,maxHeight:'85vh',display:'flex',flexDirection:'column',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:'1px solid #e5e7eb'}}>
          <h2 style={{margin:0,fontSize:20,color:'#1f2937'}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#6b7280'}}>✕</button>
        </div>
        <div style={{overflowY:'auto',flex:1,padding:24}}>
          {loading ? <p style={{textAlign:'center',color:'#6b7280',padding:40}}>Loading visitors...</p>
          : error ? <p style={{textAlign:'center',color:'#dc2626',padding:40}}>Error: {error}</p>
          : visitors.length === 0 ? <p style={{textAlign:'center',color:'#6b7280',padding:40}}>No visitors found</p>
          : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#f9fafb'}}>
                {['Name','Email','Company','Tapped',''].map(h=><th key={h} style={{textAlign:'left',padding:'10px 12px',fontSize:13,color:'#6b7280',fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {visitors.map(v=>(
                  <tr key={v.id} style={{borderTop:'1px solid #f3f4f6'}}>
                    <td style={{padding:'12px',fontWeight:600,color:'#1f2937'}}>{v.name}</td>
                    <td style={{padding:'12px',fontSize:13,color:'#6b7280'}}>{v.email||'—'}</td>
                    <td style={{padding:'12px',fontSize:13,color:'#6b7280'}}>{v.company||'—'}</td>
                    <td style={{padding:'12px',fontSize:12,color:'#9ca3af'}}>{new Date(v.created_at).toLocaleDateString()}</td>
                    <td style={{padding:'12px'}}><button onClick={()=>onSelect(v)} style={{padding:'6px 12px',background:'#eff6ff',border:'1px solid #2563eb',borderRadius:6,color:'#2563eb',fontWeight:600,cursor:'pointer',fontSize:12}}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {total > 0 && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:16,padding:'16px 24px',borderTop:'1px solid #e5e7eb'}}>
            <button disabled={page===0} onClick={()=>setPage(p=>p-1)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #d1d5db',background:page===0?'#f9fafb':'white',cursor:page===0?'default':'pointer'}}>← Prev</button>
            <span style={{fontSize:14,color:'#6b7280'}}>Page {page+1} of {pages} ({total} total)</span>
            <button disabled={page>=pages-1} onClick={()=>setPage(p=>p+1)} style={{padding:'8px 16px',borderRadius:8,border:'1px solid #d1d5db',background:page>=pages-1?'#f9fafb':'white',cursor:page>=pages-1?'default':'pointer'}}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } });
  const [page, setPage] = useState('dashboard');
  const [dashData, setDashData] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'table'|'detail', ... }

  useEffect(() => {
    if (token && user) loadDash();
  }, [token]);

  const loadDash = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/api/admin/dashboard' : '/api/customer/dashboard';
      const res = await fetch(`${API}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDashData(data);
    } catch (e) { console.error(e); }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
    const data = await res.json();
    if (data.success) {
      setToken(data.token); setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setPage('dashboard');
    } else { alert('Invalid email or password'); }
  };

  const logout = () => {
    setToken(null); setUser(null); setDashData(null);
    localStorage.removeItem('token'); localStorage.removeItem('user');
  };

  if (!token) return <LoginPage onLogin={login} />;

  const openVisitors = (title, endpoint) => setModal({ type:'table', title, endpoint });
  const openDetail = (visitor) => setModal({ type:'detail', visitor });
  const closeModal = () => setModal(null);

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8'}}>
      {/* Nav */}
      <nav style={{background:'white',boxShadow:'0 2px 8px rgba(0,0,0,0.1)',padding:'0 24px'}}>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',height:64}}>
          <span style={{fontSize:22,fontWeight:700,color:'#3b82f6'}}>📱 TagMe <span style={{fontSize:14,color:'#6b7280',fontWeight:400}}>by Hash3D</span></span>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:14,color:'#374151'}}>{user?.fullName}</span>
            <button onClick={logout} style={{padding:'8px 16px',background:'#ef4444',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600}}>Logout</button>
          </div>
        </div>
        <div style={{maxWidth:1200,margin:'0 auto',display:'flex',borderTop:'1px solid #e5e7eb'}}>
          {user?.role === 'admin' ? <>
            <Tab label="👥 Customers" active={page==='dashboard'} onClick={()=>setPage('dashboard')} />
            <Tab label="📊 Analytics" active={page==='analytics'} onClick={()=>setPage('analytics')} />
            <Tab label="⚙️ Settings" active={page==='settings'} onClick={()=>setPage('settings')} />
          </> : <>
            <Tab label="📊 Dashboard" active={page==='dashboard'} onClick={()=>setPage('dashboard')} />
            <Tab label="👥 Visitors" active={page==='visitors'} onClick={()=>setPage('visitors')} />
            <Tab label="📈 Analytics" active={page==='analytics'} onClick={()=>setPage('analytics')} />
            <Tab label="⚙️ Settings" active={page==='settings'} onClick={()=>setPage('settings')} />
          </>}
        </div>
      </nav>

      {/* Content */}
      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 24px'}}>
        {user?.role === 'admin' && page === 'dashboard' && <AdminDash data={dashData} onViewVisitors={openVisitors} />}
        {user?.role === 'customer' && page === 'dashboard' && <CustomerDash data={dashData} onViewVisitors={openVisitors} token={token} />}
        {user?.role === 'customer' && page === 'visitors' && <VisitorsPage onViewAll={() => openVisitors('All Your Visitors', '/api/customer/analytics/visitors')} />}
        {page === 'analytics' && <AnalyticsPage token={token} />}
        {page === 'settings' && <SettingsPage token={token} user={user} />}
      </div>

      {/* Modals */}
      {modal?.type === 'table' && (
        <VisitorsModal title={modal.title} endpoint={modal.endpoint} onSelect={openDetail} onClose={closeModal} />
      )}
      {modal?.type === 'detail' && (
        <VisitorDetailModal visitor={modal.visitor} onClose={closeModal} />
      )}
    </div>
  );
}

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return <button onClick={onClick} style={{padding:16,fontWeight:600,fontSize:14,border:'none',borderBottom:active?'2px solid #3b82f6':'2px solid transparent',color:active?'#3b82f6':'#6b7280',background:'transparent',cursor:'pointer'}}>{label}</button>;
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div onClick={onClick} style={{background:'white',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.1)',padding:24,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:onClick?'pointer':'default',transition:'transform 0.2s',border:'1px solid transparent'}}
      onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.borderColor='#3b82f6';}}}
      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.borderColor='transparent';}}>
      <div>
        <p style={{fontSize:13,color:'#6b7280',marginBottom:8}}>{title}</p>
        <p style={{fontSize:28,fontWeight:700,color:'#1f2937'}}>{value}</p>
        {onClick && <p style={{fontSize:11,color:'#9ca3af',marginTop:4}}>Click to view →</p>}
      </div>
      <div style={{fontSize:32,padding:16,background:`${color}20`,borderRadius:12}}>{icon}</div>
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ title, children }) {
  return <div style={{background:'white',borderRadius:12,boxShadow:'0 1px 4px rgba(0,0,0,0.1)',padding:24,marginBottom:16}}>
    {title && <h2 style={{fontSize:18,fontWeight:700,color:'#1f2937',marginBottom:16,marginTop:0}}>{title}</h2>}
    {children}
  </div>;
}

// ─── CUSTOMER DASHBOARD ───────────────────────────────────────────────────────
function CustomerDash({ data, onViewVisitors, token }) {
  if (!data) return <p style={{textAlign:'center',color:'#6b7280',padding:40}}>Loading...</p>;
  const stats = data.stats || {};
  return (
    <div>
      <h1 style={{fontSize:28,fontWeight:700,color:'#1f2937',marginBottom:24}}>📊 Your Dashboard</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <StatCard title="Total Scans" value={stats.totalScans||0} icon="📱" color="#3b82f6" />
        <StatCard title="This Month" value={stats.scansThisMonth||0} icon="📅" color="#10b981" />
        <StatCard title="This Week" value={stats.scansThisWeek||0} icon="📈" color="#8b5cf6" />
        <StatCard title="New Visitors" value={stats.newVisitors||0} icon="👥" color="#f59e0b"
          onClick={() => onViewVisitors('New Visitors This Week', '/api/customer/analytics/new-contacts')} />
      </div>
      <button onClick={() => onViewVisitors('All Your Visitors', '/api/customer/analytics/visitors')}
        style={{width:'100%',padding:14,background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',marginBottom:24,boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>
        👥 View All My Visitors
      </button>
      <ScanLocationsCard token={token} />
      <Card title="Your Profile">
        <p><strong>Name:</strong> {data.user?.full_name}</p>
        <p style={{marginTop:8}}><strong>Email:</strong> {data.user?.email}</p>
        <p style={{marginTop:8}}><strong>Plan:</strong> {data.subscription?.tier?.toUpperCase()||'No plan'}</p>
      </Card>
    </div>
  );
}

// ─── SCAN LOCATIONS CARD ──────────────────────────────────────────────────────
function ScanLocationsCard({ token }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/customer/analytics/scans?limit=8`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setScans(data.scans || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <Card title="📍 Recent Scan Locations">
      {loading ? (
        <p style={{color:'#9ca3af',fontSize:14}}>Loading...</p>
      ) : scans.length === 0 ? (
        <p style={{color:'#9ca3af',fontSize:14}}>No scans yet.</p>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12}}>
          {scans.map(s => (
            <div key={s.id} style={{border:'1px solid #e5e7eb',borderRadius:10,overflow:'hidden'}}>
              {s.latitude && s.longitude ? (
                <a
                  href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                  target="_blank" rel="noreferrer"
                  title="Open in Google Maps"
                >
                  <img
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${s.latitude},${s.longitude}&zoom=14&size=200x120&markers=${s.latitude},${s.longitude},red-pushpin`}
                    alt="Scan location"
                    style={{width:'100%',height:90,objectFit:'cover',display:'block'}}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                </a>
              ) : null}
              {!(s.latitude && s.longitude) && (
                <div style={{width:'100%',height:90,background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af',fontSize:12,textAlign:'center',padding:8}}>
                  📍 No location shared
                </div>
              )}
              <div style={{padding:'6px 8px',fontSize:11,color:'#6b7280'}}>
                {new Date(s.scanned_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── VISITORS PAGE ────────────────────────────────────────────────────────────
function VisitorsPage({ onViewAll }) {
  return (
    <div>
      <h1 style={{fontSize:28,fontWeight:700,color:'#1f2937',marginBottom:24}}>👥 Your Visitors</h1>
      <Card>
        <div style={{textAlign:'center',padding:32}}>
          <div style={{fontSize:48,marginBottom:16}}>👥</div>
          <h2 style={{fontSize:20,fontWeight:700,marginBottom:8,color:'#1f2937'}}>View Your Visitors</h2>
          <p style={{color:'#6b7280',marginBottom:24}}>See everyone who has tapped your NFC tag</p>
          <button onClick={onViewAll} style={{padding:'14px 32px',background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'white',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 12px rgba(59,130,246,0.3)'}}>
            👥 View All Visitors
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ token, user }) {
  const [pinEnabled, setPinEnabled] = useState(null); // null = still checking
  const [newPin, setNewPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API}/api/pin-required/${user.id}`);
      const data = await res.json();
      setPinEnabled(!!data.required);
    } catch (e) {
      setPinEnabled(false);
    }
  };

  const savePin = async (pinValue) => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API}/api/customer/settings/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pin: pinValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save PIN');
      setPinEnabled(data.protected);
      setNewPin('');
      setMsg({
        type: 'success',
        text: data.protected
          ? 'PIN set — your landing page now asks for it before showing your details.'
          : 'PIN removed — your landing page is open to everyone again, like before.'
      });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPin && !/^\d{4,6}$/.test(newPin)) {
      setMsg({ type: 'error', text: 'PIN must be 4-6 digits' });
      return;
    }
    savePin(newPin);
  };

  return (
    <div>
      <h1 style={{fontSize:28,fontWeight:700,color:'#1f2937',marginBottom:24}}>⚙️ Settings</h1>
      <Card title="Landing Page PIN">
        <p style={{color:'#6b7280',fontSize:14,marginBottom:16,lineHeight:1.6}}>
          Add a PIN so random people who tap your tag can't see your contact details without it. Leave it off to keep your page open to everyone, like before.
        </p>
        {pinEnabled === null ? (
          <p style={{color:'#9ca3af',fontSize:14}}>Checking current status...</p>
        ) : (
          <>
            <div style={{display:'inline-block',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,marginBottom:16,background:pinEnabled?'#ede9fe':'#f3f4f6',color:pinEnabled?'#7c3aed':'#6b7280'}}>
              {pinEnabled ? '🔒 PIN protection is ON' : '🔓 PIN protection is OFF'}
            </div>
            <form onSubmit={handleSubmit}>
              <label style={{display:'block',fontSize:14,fontWeight:500,color:'#374151',marginBottom:8}}>
                {pinEnabled ? 'Change PIN (4-6 digits)' : 'Set a PIN (4-6 digits)'}
              </label>
              <input
                type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,''))}
                placeholder="e.g. 1234"
                style={{width:'100%',maxWidth:200,padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:16,letterSpacing:4,boxSizing:'border-box',marginBottom:12}}
              />
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                <button type="submit" disabled={saving} style={{padding:'10px 20px',background:'#3b82f6',color:'white',border:'none',borderRadius:8,fontWeight:600,cursor:saving?'default':'pointer',opacity:saving?0.7:1}}>
                  {saving ? 'Saving...' : (pinEnabled ? 'Update PIN' : 'Set PIN')}
                </button>
                {pinEnabled && (
                  <button type="button" disabled={saving} onClick={()=>savePin('')} style={{padding:'10px 20px',background:'transparent',color:'#dc2626',border:'1px solid #fecaca',borderRadius:8,fontWeight:600,cursor:saving?'default':'pointer'}}>
                    Remove PIN
                  </button>
                )}
              </div>
            </form>
            {msg && (
              <p style={{marginTop:12,fontSize:13,fontWeight:600,color:msg.type==='success'?'#047857':'#dc2626'}}>
                {msg.text}
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDash({ data, onViewVisitors }) {
  if (!data) return <p style={{textAlign:'center',color:'#6b7280',padding:40}}>Loading...</p>;
  return (
    <div>
      <h1 style={{fontSize:28,fontWeight:700,color:'#1f2937',marginBottom:24}}>👥 Customer Management</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16,marginBottom:24}}>
        <StatCard title="Total Customers" value={data.totalCustomers||0} icon="👥" color="#3b82f6" />
        <StatCard title="Total Scans" value={data.totalScans||0} icon="📊" color="#10b981" />
        <StatCard title="Monthly Revenue" value={`R${data.monthRevenue||0}`} icon="💰" color="#f59e0b" />
        <StatCard title="Scans This Month" value={data.monthScans||0} icon="📈" color="#8b5cf6" />
      </div>
      <Card title="All Customers">
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#f9fafb'}}>
            {['Name','Plan','Revenue','Scans','Status'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:13,color:'#6b7280'}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {data.customers?.map(c=>(
              <tr key={c.id} style={{borderTop:'1px solid #e5e7eb'}}>
                <td style={{padding:'12px 16px',fontSize:14}}>{c.full_name}</td>
                <td style={{padding:'12px 16px'}}><span style={{padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:c.tier==='premium'?'#ede9fe':'#d1fae5',color:c.tier==='premium'?'#7c3aed':'#065f46'}}>{c.tier?.toUpperCase()||'N/A'}</span></td>
                <td style={{padding:'12px 16px',fontSize:14}}>R{c.price||0}</td>
                <td style={{padding:'12px 16px',fontSize:14}}>{c.total_scans||0}</td>
                <td style={{padding:'12px 16px'}}><span style={{padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600,background:'#d1fae5',color:'#065f46'}}>Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function AnalyticsPage({ token }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/analytics/scans`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json(); // array of { date, count } for days with at least 1 scan

        // Build the last 7 days, filling in 0 for any day with no scans
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          const label = d.toLocaleDateString('en-US', { weekday: 'short' });
          const match = Array.isArray(data) ? data.find(r => r.date && String(r.date).slice(0,10) === iso) : null;
          days.push({ date: label, scans: match ? parseInt(match.count) : 0 });
        }
        setChartData(days);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div>
      <h1 style={{fontSize:28,fontWeight:700,color:'#1f2937',marginBottom:24}}>📈 Analytics</h1>
      <Card title="Scans This Week">
        {loading ? (
          <p style={{color:'#9ca3af',fontSize:14}}>Loading...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="scans" fill="#3b82f6"/></BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    await onLogin(email, password); setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#3b82f6,#2563eb)'}}>
      <div style={{background:'white',borderRadius:16,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',padding:40,width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:40,fontWeight:700,color:'#3b82f6',marginBottom:8}}>📱 TagMe</div>
          <div style={{color:'#6b7280',fontSize:14}}>by Hash3D</div>
        </div>
        <form onSubmit={submit}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:14,fontWeight:500,color:'#374151',marginBottom:8}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:14,boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:14,fontWeight:500,color:'#374151',marginBottom:8}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',padding:'10px 12px',border:'1px solid #d1d5db',borderRadius:8,fontSize:14,boxSizing:'border-box'}} />
          </div>
          <button type="submit" disabled={loading} style={{width:'100%',padding:12,background:'#3b82f6',color:'white',border:'none',borderRadius:8,fontSize:16,fontWeight:600,cursor:'pointer'}}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={{marginTop:24,padding:16,background:'#eff6ff',borderRadius:8,fontSize:13,color:'#374151'}}>
          <strong>Demo:</strong><br/>
          john.smith@company.com<br/>
          mike.wilson@company.com<br/>
          herschelismail@gmail.com
        </div>
      </div>
    </div>
  );
}
