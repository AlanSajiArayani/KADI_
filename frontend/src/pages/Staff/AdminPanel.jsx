import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, Store, LogOut, Plus, Trash } from 'lucide-react';
import '../../staff.css';

export default function AdminPanel() {
  const { staff, logoutStaff, token } = useStaffAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalUsers: 0, totalBakeries: 0, totalSnacks: 0, totalBakers: 0 });
  const [bakers, setBakers] = useState([]);
  
  // Modals
  const [showBakerModal, setShowBakerModal] = useState(false);
  const [bakerForm, setBakerForm] = useState({ username: '', password: '' });

  useEffect(() => {
    if (!staff || staff.role !== 'admin') {
      navigate('/staff/login');
      return;
    }
    fetchData();
  }, [staff, activeTab]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (activeTab === 'dashboard') {
        const { data } = await axios.get('http://localhost:5000/admin/stats', { headers });
        setStats(data);
      } else if (activeTab === 'bakers') {
        const { data } = await axios.get('http://localhost:5000/admin/bakers', { headers });
        setBakers(data);
      }
    } catch (err) { console.error(err); }
  };

  const handleCreateBaker = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/admin/bakers', bakerForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowBakerModal(false);
      setBakerForm({ username: '', password: '' });
      fetchData();
    } catch (err) { alert('Failed to create baker account'); }
  };

  const handleDeleteBaker = async (id) => {
    if (!window.confirm('Delete baker?')) return;
    try {
      await axios.delete(`http://localhost:5000/admin/bakers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="staff-container">
      {/* Sidebar */}
      <aside className="staff-sidebar">
        <div className="sidebar-header">
          <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem' }}>KADI Admin</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Superuser Portal</p>
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Dashboard
          </li>
          <li className={`sidebar-item ${activeTab === 'bakers' ? 'active' : ''}`} onClick={() => setActiveTab('bakers')}>
            <Users size={20} /> Baker Accounts
          </li>
          <li className="sidebar-item" onClick={() => { logoutStaff(); navigate('/staff/login'); }}>
            <LogOut size={20} /> Logout
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="staff-content">
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-title">Total Users</span>
                <span className="stat-value">{stats.totalUsers}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Bakeries</span>
                <span className="stat-value">{stats.totalBakeries}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Menu Items</span>
                <span className="stat-value">{stats.totalSnacks}</span>
              </div>
              <div className="stat-card">
                <span className="stat-title">Baker Accounts</span>
                <span className="stat-value">{stats.totalBakers}</span>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Advanced analytics and charts will be populated here as user activity grows.</p>
            </div>
          </div>
        )}

        {activeTab === 'bakers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h1>Baker Management</h1>
              <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => setShowBakerModal(true)}>
                <Plus size={18} /> New Baker
              </button>
            </div>
            
            <div className="glass-table-wrapper">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Linked Bakery</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bakers.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 600 }}>{b.username}</td>
                      <td>{b.bakeryId ? b.bakeryId.name : <span style={{ color: 'var(--text-secondary)' }}>Unlinked</span>}</td>
                      <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-glass" style={{ padding: '0.4rem', border: 'none', color: '#f87171' }} onClick={() => handleDeleteBaker(b._id)}>
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bakers.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No baker accounts found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Create Baker Modal */}
      {showBakerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create Baker Account</h2>
              <button className="btn-close" onClick={() => setShowBakerModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateBaker}>
              <div className="form-group">
                <label>Username</label>
                <input required className="input-glass" value={bakerForm.username} onChange={e => setBakerForm({...bakerForm, username: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input required className="input-glass" type="password" value={bakerForm.password} onChange={e => setBakerForm({...bakerForm, password: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
