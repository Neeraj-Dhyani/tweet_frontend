import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, user, loading } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (loading || !user) return <div className="splash">Loading…</div>;
  return children;
}
