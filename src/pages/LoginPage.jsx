import { useEffect, useState } from "react";
import styles from "./../assets/styles/login.module.css";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "./../context/auth.context";
import { useNavigate } from "react-router-dom";

function Login() {
  const { t } = useTranslation();
  const { isLoggedIn, isLoadingContext, setIsLoggedIn, setLoggedUserId, setLoggedUserProfilImage } = useContext(AuthContext);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { username: credentials.username, password: credentials.password },
      );

      if (response.status != 200) {
        setError(response.data.message || "Erreur de connexion");
      }

      localStorage.setItem("token", response.data.token);
      setLoggedUserId(response.data.payload.id);
      setLoggedUserProfilImage(response.data.profilImage);
      setIsLoggedIn(true);
      navigate("/");
      // redirection à ajouter ici selon ton système de routing
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingContext && isLoggedIn) {
      navigate("/");
    }
  }, [isLoadingContext, isLoggedIn, navigate]);

  if(isLoadingContext){
    return(<h2>Essaie une auto connexion</h2>)
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1>
          R6 STRAT <span className="gold">MAKER</span>
        </h1>

        <form onSubmit={handleLogin}>
          <div className={styles.field}>
            <label>{t("username")}</label>
            <input
              type="text"
              name="username"
              placeholder={t("login.username-placeholder")}
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>{t("password")}</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className={styles.buttonConnexion} disabled={isLoading}>
            {isLoading ? t("loading") : t("login.title-button")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
