import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Onboarding() {
  const { token, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', dob: '', mobileNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.put('http://127.0.0.1:5000/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      completeProfile(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="auth-card glass-panel"
      >
        <h1 className="card-title">Just one more step</h1>
        <p className="card-subtitle">Tell us a bit about yourself.</p>
        
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <input 
              type="text" 
              placeholder="First Name" 
              className="input-glass"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Date of Birth</label>
            <input 
              type="date" 
              className="input-glass"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Mobile Number</label>
            <input 
              type="text" 
              placeholder="e.g. 9876543210" 
              className="input-glass"
              value={formData.mobileNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, mobileNumber: val });
              }}
              required
              minLength={10}
              maxLength={15}
            />
            <p style={{ textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Required for baker communications.</p>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
