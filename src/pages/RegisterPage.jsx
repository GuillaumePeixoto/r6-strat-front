import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(null);

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);
    if (!username || !password) {
      setError("You need to complete the form.");
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`);
      navigate("/login");
    } catch (err) {
      setError("Une erreur s'est produite : " + err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="mb-1">
          {t("register.title-part1")}{" "}
          <span className="gold">{t("register.title-part2")}</span>
        </h1>

        <form onSubmit={handleRegister}>
          <div className="field">
            <label>{t("username")}</label>
            <input
              type="text"
              name="username"
              placeholder={t("register.username-placeholder")}
              value={username}
              onChange={() => setUsername()}
              required
            />
          </div>

          <div className="field">
            <label>{t("password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t("register.password-placeholder")}
              value={password}
              onChange={() => setPassword}
              required
            />
          </div>

          <div className="field">
            <label>{t("register.repeat-password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t("register.repeat-password")}
              value={repeatPassword}
              onChange={() => setRepeatPassword()}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? t("loading") : t("register.title-button")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
