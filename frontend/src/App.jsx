import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import StaffLogin from './pages/Staff/StaffLogin';
import AdminPanel from './pages/Staff/AdminPanel';
import BakerPanel from './pages/Staff/BakerPanel';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', position: 'relative' }}>
      {/* Background blobs for neumorphic feel */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(50px)', zIndex: -1 }}></div>

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ maxWidth: '800px' }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem', textShadow: 'var(--glass-shadow)' }}>
          Discover the Art of <span style={{ color: 'var(--primary)', textShadow: 'var(--glow)' }}>Baking</span> Next Door.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          Explore nearby bakeries through our immersive map, find your favorite snacks, and taste the world class quality exactly where you are.
        </p>
        
        {user ? (
           <motion.a href="/dashboard" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', textDecoration: 'none' }} whileHover={{ scale: 1.05 }}>
             Go to Dashboard <ArrowRight size={20} />
           </motion.a>
        ) : (
           <motion.a href="/login" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', textDecoration: 'none' }} whileHover={{ scale: 1.05 }}>
             Get Started <ArrowRight size={20} />
           </motion.a>
        )}
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={
            <ProtectedRoute requireProfile={false}>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/baker" element={<BakerPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
