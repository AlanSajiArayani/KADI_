import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import BakeryCatalog from './pages/BakeryCatalog';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import StaffLogin from './pages/Staff/StaffLogin';
import AdminPanel from './pages/Staff/AdminPanel';
import BakerPanel from './pages/Staff/BakerPanel';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// LandingPage moved to specific Home component

export default function App() {
  return (
    <CartProvider>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route path="/bakery/:id" element={<BakeryCatalog />} />
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/baker" element={<BakerPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </CartProvider>
  );
}
