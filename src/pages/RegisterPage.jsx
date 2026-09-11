import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "./../context/auth.context";
import styles from "./../assets/styles/login.module.css";

function RegisterPage() {
  const { isLoggedIn, isLoadingContext} =
    useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);
    if (!username || !password || !repeatPassword) {
      setError("You need to complete the form.");
      setIsLoading(false);
      return;
    }

    if (password != repeatPassword) {
      setError("");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        username,
        password,
      });
      navigate("/login");
    } catch (err) {
      setError("Une erreur s'est produite : " + err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoadingContext && isLoggedIn) {
      navigate("/");
    }
  }, [isLoadingContext, isLoggedIn, navigate]);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className="mb-1">
          {t("register.title-part1")}{" "}
          <span className="gold">{t("register.title-part2")}</span>
        </h1>

        <form onSubmit={handleRegister}>
          <div className={styles.field}>
            <label>{t("username")}</label>
            <input
              type="text"
              name="username"
              placeholder={t("register.username-placeholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label>{t("password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t("register.password-placeholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label>{t("register.repeat-password")}</label>
            <input
              type="password"
              name="password"
              placeholder={t("register.repeat-password")}
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className={styles.buttonConnexion} disabled={isLoading}>
            {isLoading ? t("loading") : t("register.title-button")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
