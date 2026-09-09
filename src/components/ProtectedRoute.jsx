import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoadingContext } = useContext(AuthContext);

  if (isLoadingContext) {
    return <h2>Chargement...</h2>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;