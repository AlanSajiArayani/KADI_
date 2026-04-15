import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  
  const formattedDob = user?.dob 
    ? new Date(user.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not provided';

  return (
    <div className="minimal-dashboard-container">
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: -1 }}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="minimal-dashboard-card glass-panel"
      >
        <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
          Welcome, <br /><span style={{ color: 'var(--primary)', textShadow: 'var(--glow)' }}>{user?.firstName || 'Guest'}</span>
        </h1>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.02)', padding: '1.5rem 3rem', borderRadius: '24px', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date of Birth</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{formattedDob}</p>
        </div>
      </motion.div>
    </div>
  );
}
