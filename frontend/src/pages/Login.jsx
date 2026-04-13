import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse) => {
    try {
      const { data } = await axios.post('http://localhost:5000/auth/google', {
        credential: credentialResponse.credential
      });
      
      login(data.token, data.user);
      
      if (!data.user.profileComplete) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to authenticate with backend');
    }
  };

  return (
    <div className="auth-container" style={{
      background: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.15) 0%, var(--bg-color) 60%)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="auth-card glass-panel"
      >
        <img src="/logo.png" alt="KADI Logo" style={{ height: '80px', marginBottom: '1.5rem' }} onError={(e) => { e.target.style.display = 'none'; }} />
        <h1 className="card-title" style={{textShadow: 'var(--glow)'}}>Welcome Back</h1>
        <p className="card-subtitle">Sign in to discover premium bakeries nearby.</p>
        
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              setError('Google Authentication Failed');
            }}
            theme="filled_black"
            shape="pill"
          />
        </div>
        
        <p style={{ marginTop: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account? Simply sign in with Google to get started.
        </p>
      </motion.div>
    </div>
  );
}
