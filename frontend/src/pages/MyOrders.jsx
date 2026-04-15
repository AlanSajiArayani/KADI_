import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

export default function MyOrders() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token || !user) return;

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` } });
        setOrders(data);
      } catch (err) { console.error('Failed formatting my orders', err); }
    };
    fetchOrders();

    // Setup basic sockets
    const socket = io('http://localhost:5000');
    socket.emit('joinRoom', `user_${user._id || user.id}`);

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, user]);

  return (
    <div style={{ padding: '120px 2rem 4rem 2rem', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1 }}></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, textShadow: 'var(--glow)' }}>My Orders</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your liquid glass treats down to the minute.</p>
      </motion.div>

      <div style={{ display: 'grid', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {orders.length > 0 ? orders.map((order, idx) => (
          <motion.div 
            key={order._id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel"
            style={{ padding: '2rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: order.status === 'Ready' ? '4px solid #4ade80' : '4px solid var(--primary)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{order.bakeryName}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Order ID: {order._id.substring(order._id.length - 6).toUpperCase()}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px', background: order.status === 'Ready' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(249, 115, 22, 0.1)', color: order.status === 'Ready' ? '#4ade80' : 'var(--primary)', fontWeight: 700 }}>
                  {order.status === 'Ready' ? <CheckCircle size={18} /> : order.status === 'Preparing' ? <Clock size={18} /> : <Package size={18} />}
                  {order.status}
                </div>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.5rem 0 0 0' }}>₹{order.totalPrice.toFixed(2)}</h4>
              </div>
            </div>
            <div>
              {order.items.map(item => (
                <div key={item.snackId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'var(--text-secondary)' }}>
                  <span><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.quantity}x</span> {item.title}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )) : <p style={{ textAlign: 'center', width: '100%' }}>You haven't ordered anything yet.</p>}
      </div>
    </div>
  );
}
