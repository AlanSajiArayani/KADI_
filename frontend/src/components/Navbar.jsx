import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Menu, X, ShoppingCart, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar glass-panel">
      <div className="nav-container">
        <div className="nav-links">
          <Link to="/" className="nav-link" aria-label="Home" onClick={closeMenu}>
            <Home size={22} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
             <img src="/logo.png" alt="KADI" style={{height: '32px', width: 'auto'}} onError={(e) => { e.target.style.display = 'none'; }} />
             KADI
          </div>
        </div>
        
        {/* Mobile menu toggle */}
        <div className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        {/* Desktop and Mobile Links */}
        <div className={`nav-actions ${isOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" style={{ textShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }} onClick={closeMenu}>Dashboard</Link>
              <Link to="/my-orders" className="nav-link" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                 <Clock size={18}/> Orders
              </Link>
              <Link to="/cart" className="nav-link" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: cart.items.length > 0 ? 'var(--primary)' : 'var(--text-primary)' }}>
                 <div style={{ position: 'relative' }}>
                   <ShoppingCart size={20} />
                   {cart.items.length > 0 && <span style={{ position: 'absolute', top: -8, right: -12, background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 700 }}>{cart.items.length}</span>}
                 </div>
                 Cart
              </Link>
              <button onClick={handleLogout} className="btn-glass" style={{ marginLeft: '1rem' }}>Logout</button>
            </>
          ) : (
            <>
               <Link to="#" className="nav-link" onClick={closeMenu}>CONTACT</Link>
              <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }} onClick={closeMenu}>Login ✦</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
