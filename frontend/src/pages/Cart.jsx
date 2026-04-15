import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!token || cart.items.length === 0) return;
    setLoading(true);
    try {
      const orderPayload = {
        bakeryId: cart.bakeryId,
        bakeryName: cart.bakeryName,
        totalPrice: cartTotal,
        items: cart.items.map(i => ({
          snackId: i._id,
          title: i.title,
          price: i.price,
          quantity: i.quantity
        }))
      };

      await axios.post('http://localhost:5000/api/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '120px 2rem 4rem 2rem', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1 }}></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '800px', borderRadius: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShoppingBag size={36} color="var(--primary)" /> Your Cart
        </h1>

        {cart.items.length > 0 ? (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem 2rem', borderRadius: '20px', marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Ordering from: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{cart.bakeryName}</span></p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
              {cart.items.map(item => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <img src={item.image} alt={item.title} style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</h4>
                      <p style={{ color: 'var(--text-secondary)' }}>${item.price?.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button className="btn-glass" style={{ padding: '0.25rem 0.75rem' }} onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="btn-glass" style={{ padding: '0.25rem 0.75rem' }} onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <span style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    <button className="btn-glass" onClick={() => removeFromCart(item._id)} style={{ padding: '0.5rem', border: 'none', color: '#f87171' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem', background: 'var(--glass-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Total Cost</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</p>
              </div>
              <button className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '30px' }} onClick={placeOrder} disabled={loading}>
                {loading ? 'Processing...' : 'PACK UP'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Your cart is empty.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
