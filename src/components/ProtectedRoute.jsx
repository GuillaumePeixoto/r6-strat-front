import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { useTranslation } from "react-i18next";

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoadingContext } = useContext(AuthContext);
  const { t } = useTranslation();

  if (isLoadingContext) {
    return <h2>{t('loading')}</h2>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;