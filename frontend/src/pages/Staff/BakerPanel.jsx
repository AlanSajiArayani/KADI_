import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../../context/StaffAuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Coffee, LogOut, Plus, Edit2, Trash, ClipboardList, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import '../../staff.css';

export default function BakerPanel() {
  const { staff, logoutStaff, token } = useStaffAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu'); /* 'menu' or 'orders' */
  const [bakery, setBakery] = useState(null);
  const [snacks, setSnacks] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Modals
  const [showBakeryModal, setShowBakeryModal] = useState(false);
  const [showSnackModal, setShowSnackModal] = useState(false);
  const [bakeryForm, setBakeryForm] = useState({ name: '', description: '', lat: '', lng: '', image: '' });
  const [snackForm, setSnackForm] = useState({ title: '', description: '', price: '', category: 'Sweet', quantity: 0, image: '', _id: null });

  useEffect(() => {
    if (!staff || staff.role !== 'baker') {
      navigate('/staff/login');
      return;
    }
    fetchProfile();
  }, [staff]);

  useEffect(() => {
    if (bakery && token) {
      // Fetch initial orders
      fetchOrders();

      const socket = io('http://localhost:5000');
      // Join bakery specific room to get new orders
      socket.emit('joinRoom', bakery._id);
      
      socket.on('newOrder', (order) => {
        setOrders(prev => [order, ...prev]);
        // Optional alert or sound for the baker
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [bakery, token]);

  const fetchProfile = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get('http://localhost:5000/baker/bakery', { headers });
      if (data) {
        setBakery(data);
        fetchMenu(headers);
      } else {
        setShowBakeryModal(true);
      }
    } catch (err) { console.error(err); }
  };

  const fetchMenu = async (headers) => {
    try {
      const { data } = await axios.get('http://localhost:5000/baker/snacks', { headers: headers || { Authorization: `Bearer ${token}` } });
      setSnacks(data);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/baker/orders', { headers: { Authorization: `Bearer ${token}` } });
      setOrders(data);
    } catch (err) { console.error(err); }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`http://localhost:5000/baker/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(prev => prev.map(o => o._id === orderId ? data : o));
    } catch (err) { console.error("Could not update order status", err); }
  };

  const handleBakerySubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (bakery) {
        await axios.put('http://localhost:5000/baker/bakery', bakeryForm, { headers });
      } else {
        await axios.post('http://localhost:5000/baker/bakery', bakeryForm, { headers });
      }
      setShowBakeryModal(false);
      fetchProfile();
    } catch (err) { alert('Failed saving bakery'); }
  };

  const handleSnackSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (snackForm._id) {
        await axios.put(`http://localhost:5000/baker/snacks/${snackForm._id}`, snackForm, { headers });
      } else {
        await axios.post('http://localhost:5000/baker/snacks', snackForm, { headers });
      }
      setShowSnackModal(false);
      setSnackForm({ title: '', description: '', price: '', category: 'Sweet', quantity: 0, image: '', _id: null });
      fetchMenu();
    } catch (err) { alert('Failed saving snack'); }
  };

  const handleDeleteSnack = async (id) => {
    if(!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`http://localhost:5000/baker/snacks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMenu();
    } catch (err) { alert('Failed deletion'); }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="staff-container">
      <aside className="staff-sidebar">
        <div className="sidebar-header">
          <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem' }}>KADI Baker</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{bakery ? bakery.name : 'Unregistered'}</p>
        </div>
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <Coffee size={20} /> Menu Items
          </li>
          <li className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ClipboardList size={20} /> Live Orders
          </li>
          <li className="sidebar-item" onClick={() => {
            setBakeryForm({ name: bakery?.name||'', description: bakery?.description||'', lat: bakery?.location?.lat||'', lng: bakery?.location?.lng||'', image: bakery?.images?.[0]||'' });
            setShowBakeryModal(true);
          }}>
            <LayoutDashboard size={20} /> Bakery Profile
          </li>
          <li className="sidebar-item" onClick={() => { logoutStaff(); navigate('/staff/login'); }}>
            <LogOut size={20} /> Logout
          </li>
        </ul>
      </aside>

      <main className="staff-content">
        <h1 style={{ marginBottom: '0.5rem' }}>{getGreeting()}, {staff?.username}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your inventory and live orders.</p>

        {activeTab === 'menu' && (
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-title">Total Items</span>
              <span className="stat-value">{snacks.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Available</span>
              <span className="stat-value">{snacks.filter(s => s.quantity > 0).length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Out of Stock</span>
              <span className="stat-value">{snacks.filter(s => s.quantity <= 0).length}</span>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="stat-grid">
            <div className="stat-card" style={{ borderColor: 'var(--primary)', boxShadow: 'var(--glow)' }}>
              <span className="stat-title">Pending Orders</span>
              <span className="stat-value">{orders.filter(o => o.status === 'Pending').length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Preparing</span>
              <span className="stat-value">{orders.filter(o => o.status === 'Preparing').length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-title">Completed Today</span>
              <span className="stat-value">{orders.filter(o => o.status === 'Ready').length}</span>
            </div>
          </div>
        )}

        {activeTab === 'menu' && bakery && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 300 }}>Inventory Tracker</h2>
              <button className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => {
                setSnackForm({ title: '', description: '', price: '', category: 'Sweet', quantity: 0, image: '', _id: null });
                setShowSnackModal(true);
              }}>
                <Plus size={18} /> Add Item
              </button>
            </div>
            
            <div className="glass-table-wrapper">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {snacks.map(snack => (
                    <tr key={snack._id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {snack.image ? <img src={snack.image} alt="snack" style={{width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover'}} /> : <div style={{width: '40px', height: '40px', background: 'var(--glass-bg)', borderRadius: '8px'}}></div>}
                        <span style={{ fontWeight: 600 }}>{snack.title}</span>
                      </td>
                      <td>₹{snack.price?.toFixed(2)}</td>
                      <td>{snack.quantity}</td>
                      <td>
                        {snack.quantity > 0 
                          ? <span className="status-badge status-available">Available</span>
                          : <span className="status-badge status-out">Out of Stock</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                           <button className="btn-glass" style={{ padding: '0.4rem', border: 'none' }} onClick={() => { setSnackForm(snack); setShowSnackModal(true); }}>
                             <Edit2 size={16} />
                           </button>
                           <button className="btn-glass" style={{ padding: '0.4rem', border: 'none', color: '#f87171' }} onClick={() => handleDeleteSnack(snack._id)}>
                             <Trash size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {snacks.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No items found. Start adding your menu!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && bakery && (
          <div>
            <h2 style={{ fontWeight: 300, marginBottom: '1.5rem' }}>Active Orders</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map(order => (
                <div key={order._id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: order.status === 'Pending' ? '4px solid var(--primary)' : order.status === 'Ready' ? '4px solid #4ade80' : '4px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Order: {order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Placed: {new Date(order.createdAt).toLocaleTimeString()}</p>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>Customer: <b>{order.customerName || "Unknown"}</b></p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Phone: {order.customerPhone || "N/A"}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="status-badge" style={{ display: 'inline-block', marginBottom: '0.5rem', background: order.status === 'Pending' ? 'rgba(249,115,22,0.1)' : order.status === 'Ready' ? 'rgba(74,222,128,0.1)' : 'rgba(56,189,248,0.1)', color: order.status === 'Pending' ? 'var(--primary)' : order.status === 'Ready' ? '#4ade80' : '#38bdf8' }}>
                        {order.status}
                      </span>
                      <h4 style={{ margin: 0 }}>₹{order.totalPrice.toFixed(2)}</h4>
                    </div>
                  </div>
                  <div>
                    {order.items.map(i => (
                      <div key={i.snackId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                        <span><span style={{ fontWeight: 700, color: 'var(--primary)' }}>{i.quantity}x</span> {i.title}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    {order.status === 'Pending' && (
                      <button className="btn-primary" onClick={() => updateOrderStatus(order._id, 'Preparing')}>
                        Accept & Prepare
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button className="btn-primary" style={{ background: '#4ade80', color: '#000' }} onClick={() => updateOrderStatus(order._id, 'Ready')}>
                        <CheckCircle size={18} style={{ marginRight: '0.5rem', display: 'inline' }} /> Mark READY
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No orders have come in yet.</p>}
            </div>
          </div>
        )}
      </main>

      {/* Bakery Registration/Edit Modal */}
      {showBakeryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{bakery ? 'Edit Bakery Profile' : 'Setup Your Bakery'}</h2>
              {bakery && <button className="btn-close" onClick={() => setShowBakeryModal(false)}>&times;</button>}
            </div>
            <form onSubmit={handleBakerySubmit}>
              <div className="form-group">
                <label>Bakery Name</label>
                <input required className="input-glass" value={bakeryForm.name} onChange={e => setBakeryForm({...bakeryForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input-glass" rows="2" value={bakeryForm.description} onChange={e => setBakeryForm({...bakeryForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Latitude (Location)</label>
                  <input required className="input-glass" type="number" step="any" value={bakeryForm.lat} onChange={e => setBakeryForm({...bakeryForm, lat: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Longitude (Location)</label>
                  <input required className="input-glass" type="number" step="any" value={bakeryForm.lng} onChange={e => setBakeryForm({...bakeryForm, lng: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Cover Image URL</label>
                <input className="input-glass" value={bakeryForm.image} onChange={e => setBakeryForm({...bakeryForm, image: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Bakery</button>
            </form>
          </div>
        </div>
      )}

      {/* Snack Modal */}
      {showSnackModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{snackForm._id ? 'Edit Item' : 'Add Item'}</h2>
              <button className="btn-close" onClick={() => setShowSnackModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSnackSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input required className="input-glass" value={snackForm.title} onChange={e => setSnackForm({...snackForm, title: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price</label>
                  <input required className="input-glass" type="number" step="0.01" value={snackForm.price} onChange={e => setSnackForm({...snackForm, price: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select className="input-glass" value={snackForm.category} onChange={e => setSnackForm({...snackForm, category: e.target.value})}>
                    <option value="Sweet" style={{color: 'black'}}>Sweet</option>
                    <option value="Savory" style={{color: 'black'}}>Savory</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Quantity in Stock</label>
                <input required className="input-glass" type="number" value={snackForm.quantity} onChange={e => setSnackForm({...snackForm, quantity: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input className="input-glass" value={snackForm.image} onChange={e => setSnackForm({...snackForm, image: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input-glass" rows="2" value={snackForm.description} onChange={e => setSnackForm({...snackForm, description: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
