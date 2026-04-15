import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Minus, Plus } from 'lucide-react';

export default function BakeryCatalog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToCart } = useCart();
  const [snacks, setSnacks] = useState([]);
  const [bakeryName, setBakeryName] = useState('Loading...');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [snacksRes, bakRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/snacks?bakeryId=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/bakeries')
        ]);
        setSnacks(snacksRes.data);
        const b = bakRes.data.find(b => b._id === id);
        if (b) setBakeryName(b.name);
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchCatalog();
  }, [id, token]);

  return (
    <div style={{ padding: '120px 2rem 4rem 2rem', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1 }}></div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700, textShadow: 'var(--glow)' }}>{bakeryName} Catalog</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Select exquisite treats to PACK IT securely into your cart.</p>
      </motion.div>

      <div className="food-catalog-grid">
        {snacks.length > 0 ? snacks.map((snack, idx) => (
          <ItemCard key={snack._id} snack={snack} idx={idx} bakeryId={id} bakeryName={bakeryName} addToCart={addToCart} user={user} navigate={navigate} />
        )) : <p style={{ textAlign: 'center', width: '100%' }}>No items available in this bakery yet.</p>}
      </div>
    </div>
  );
}

function ItemCard({ snack, idx, bakeryId, bakeryName, addToCart, user, navigate }) {
  const [qty, setQty] = useState(1);

  const handlePackIt = () => {
    if (!user) {
      if(window.confirm('You must be logged in to place an order. Redirect to login?')) {
        navigate('/login');
      }
      return;
    }
    addToCart(bakeryId, bakeryName, snack, qty);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="snack-card glass-panel"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '24px' }}
    >
      <img src={snack.image} alt={snack.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderBottom: '1px solid var(--glass-border)' }} />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{snack.title}</h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>${(snack.price || 0).toFixed(2)}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: snack.quantity > 0 ? '#4ade80' : '#f87171' }}>{snack.quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', flex: 1 }}>{snack.description}</p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--glass-bg)', borderRadius: '15px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <button disabled={snack.quantity <= 0} onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><Minus size={18} /></button>
            <span style={{ width: '30px', textAlign: 'center', fontWeight: '600' }}>{qty}</span>
            <button disabled={snack.quantity <= 0} onClick={() => setQty(qty + 1)} style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><Plus size={18} /></button>
          </div>
          <button 
            disabled={snack.quantity <= 0}
            className="btn-primary" 
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: snack.quantity <= 0 ? 0.5 : 1 }}
            onClick={handlePackIt}
          >
            <ShoppingBag size={18} /> PACK IT
          </button>
        </div>
      </div>
    </motion.div>
  );
}
