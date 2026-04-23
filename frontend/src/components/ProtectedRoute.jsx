import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards any route that requires authentication.
 * Unauthenticated users are redirected to /login; the `replace` flag
 * prevents the login page from appearing in browser history so
 * pressing Back doesn't loop the user back to a blocked page.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
