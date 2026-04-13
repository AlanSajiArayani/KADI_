import { Link, useNavigate } from 'react-router-dom';
import { Home, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-links">
        <Link to="/" className="nav-link" aria-label="Home">
          <Home size={22} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
           {/* Fallback to text if logo unavailable */}
           <img src="/logo.png" alt="KADI Logo" style={{height: '32px', width: 'auto'}} onError={(e) => { e.target.style.display = 'none'; }} />
           KADI
        </div>
      </div>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link" style={{ textShadow: '0 0 10px rgba(249, 115, 22, 0.4)' }}>DASHBOARD</Link>
            <Link to="#" className="nav-link">CONTACT</Link>
            <button onClick={handleLogout} className="btn-glass">Logout</button>
          </>
        ) : (
          <>
             <Link to="#" className="nav-link">CONTACT</Link>
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Login ✦</Link>
          </>
        )}
      </div>
    </nav>
  );
}
