import { useState } from "react";
import "./../assets/styles/login.compenent.css";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();

  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
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
      const response = await fetch("http://localhost:5005/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      localStorage.setItem("token", data.token);
      // redirection à ajouter ici selon ton système de routing
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>
          R6 STRAT <span className="gold">MAKER</span>
        </h1>

        <form onSubmit={handleLogin}>
          <div className="field">
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

          <div className="field">
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

          <button type="submit" disabled={isLoading}>
            {isLoading ? t("loading") : t("login.title-button")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
