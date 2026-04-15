import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Edit3, Check, X } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const { user, token, completeProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
    mobileNumber: user?.mobileNumber || ''
  });

  // Re-sync form if user object updates
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || '',
      dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
      mobileNumber: user?.mobileNumber || ''
    });
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data } = await axios.put('http://localhost:5000/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Pass the direct server response object to update context
      completeProfile(data); 
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const formattedDob = user?.dob 
    ? new Date(user.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not provided';

  return (
    <div className="minimal-dashboard-container" style={{ padding: '120px 2rem 4rem 2rem' }}>
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: -1 }}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="minimal-dashboard-card glass-panel"
        style={{ position: 'relative' }}
      >
        {!isEditing && (
           <button 
             className="btn-glass" 
             style={{ position: 'absolute', top: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem' }}
             onClick={() => setIsEditing(true)}
           >
             <Edit3 size={16} /> Edit
           </button>
        )}

        <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>
          Welcome, <br /><span style={{ color: 'var(--primary)', textShadow: 'var(--glow)' }}>{user?.firstName || 'Guest'}</span>
        </h1>
        
        {isEditing ? (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', background: 'rgba(0,0,0,0.1)', padding: '2rem', borderRadius: '24px' }}>
            {error && <p style={{ color: '#ef4444', margin: 0, textAlign: 'center' }}>{error}</p>}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>First Name</label>
              <input 
                type="text" 
                className="input-glass"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
              <input 
                type="date" 
                className="input-glass"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Mobile Number</label>
              <input 
                type="text" 
                className="input-glass"
                placeholder="e.g. 9876543210"
                value={formData.mobileNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, mobileNumber: val });
                }}
                required
                minLength={10}
                maxLength={15}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn-glass" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }} onClick={() => { setIsEditing(false); setError(''); }}>
                 <X size={18} /> Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <Check size={18} /> {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Mobile Number</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 500, color: user?.mobileNumber ? 'var(--text-primary)' : 'var(--primary)', marginTop: '0.5rem' }}>
                {user?.mobileNumber || 'Please provide a contact number'}
              </p>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date of Birth</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{formattedDob}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
