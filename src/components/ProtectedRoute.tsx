import { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    console.log("🔍 getCurrentUser:", storedUser);

    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!user) {
    console.log("⛔ Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Authenticated, rendering route");
  return <>{children}</>;
};

export default ProtectedRoute;
