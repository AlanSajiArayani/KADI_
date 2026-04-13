import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireProfile = true }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{height: '100vh', display: 'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireProfile && !user.profileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
