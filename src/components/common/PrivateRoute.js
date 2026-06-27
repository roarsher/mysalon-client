 import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute
 * ------------
 * JWT-based guard. If no token in context/localStorage → redirect to /login.
 * Saves the attempted URL so after login the user lands where they wanted to go.
 */
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location        = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;