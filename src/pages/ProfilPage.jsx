import { useEffect, useState, useContext } from "react";
import api from "../services/api";
import StrategyCard from "../components/StrategyCard";
import { Link, useNavigate } from "react-router-dom";
import AgentSelector from "../components/AgentSelector";
import { AuthContext } from "./../context/auth.context";
import { useTranslation } from "react-i18next";

function PasswordField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  return (
    <label className="block">
      <span className="block text-[12px] text-[#8B909B] mb-1">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full bg-[#12141A] border border-[#2A2E37] focus:border-[#E8833E] outline-none text-[13px] text-[#ECEAE4] px-3 py-2 pr-16 transition-colors"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#5B6170] hover:text-[#ECEAE4]"
        >
          {visible ? t("common.hide") : t("common.show")}
        </button>
      </div>
    </label>
  );
}

function PasswordPanel({ open, hidePanel }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const sendUpdatePassword = async () => {
    if (!current || !newPassword || !confirmPassword) {
      return "error";
    }

    if (newPassword != confirmPassword) {
      return "error";
    }

    try {
      await api.post(`api/update-password`, {
        current,
        newPassword,
        confirmPassword,
      });
      setSaved(true);
    } catch (err) {
      return err;
    }
  };

  if (!open) return null;

  return (
    <div className="mt-4 border border-[#262B34] bg-[#12141A] p-4 space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <PasswordField
          label={t("profile.currentPassword")}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <PasswordField
          label={t("profile.newPassword")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordField
          label={t("profile.confirmation")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => sendUpdatePassword()}
          className="cursor-pointer bg-[#f0ad1a] hover:bg-[#bb8716] text-[#12141A] text-[13px] font-semibold px-4 py-2 transition-colors"
        >
          {t("profile.savePassword")}
        </button>
        <button
          onClick={() => hidePanel()}
          className="cursor-pointer bg-[#0F1115] inline-flex items-center gap-2 text-[13px] text-[#8B909B] hover:text-[#ECEAE4] border border-[#2A2E37] hover:border-[#3A404C] px-4 py-2 transition-colors"
        >
          {t("common.cancel")}
        </button>
        {saved && (
          <span className="text-[12px] text-[#6FCF97]">
            {t("profile.passwordUpdated")}
          </span>
        )}
      </div>
    </div>
  );
}

function Profil() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [profilImage, setProfilImage] = useState("");
  const [newProfilImage, setNewProfilImage] = useState(null);
  const [ownStrats, setOwnStrats] = useState([]);
  const [ownStratsTotal, setOwnStratsTotal] = useState(0);
  const [favoriteStrats, setFavoriteStrats] = useState([]);
  const [favoriteStratsTotal, setFavoriteStratsTotal] = useState(0);
  const [agentsList, setAgentsList] = useState([]);
  const [changeImage, setChangeImage] = useState(false);

  const navigate = useNavigate();
  const { setLoggedUserProfilImage } = useContext(AuthContext);

  const getProfileInfos = async () => {
    try {
      const response = await api.get("/api/profile");
      setUsername(response.data.username);
      setProfilImage(response.data.image);
      setOwnStrats(response.data.ownStrategies);
      setOwnStratsTotal(response.data.ownStratsTotal);
      setFavoriteStrats(response.data.favoriteStrategies);
      setFavoriteStratsTotal(response.data.favoriteStrategiesTotal);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAgentsList = async () => {
    try {
      const response = await api.get("/api/agents");
      setAgentsList(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des agents:", error);
    }
  };

  const goToDetails = (id) => {
    navigate(`/strategies/${id}`);
  };

  const handleFavoriteToggle = async (strat) => {
    const isFavorite = await toggleFavorite(strat);

    // 1. Gestion du tableau FAVORIS (Ajout ou Retrait)
    setFavoriteStrats((prev) => {
      if (!isFavorite) {
        // Retiré des favoris -> disparaît de la liste des favoris
        return prev.filter((s) => s.id !== strat.id);
      }

      // Ajouté aux favoris -> s'ajoute au début de la liste si pas encore présente
      const alreadyInFav = prev.some((s) => s.id === strat.id);
      if (!alreadyInFav) {
        return [{ ...strat, is_favorite_for_me: true }, ...prev];
      }

      return prev;
    });

    // 2. Gestion du tableau TES STRATÉGIES (Mise à jour du statut uniquement)
    setOwnStrats((prev) =>
      prev.map((s) =>
        s.id === strat.id ? { ...s, is_favorite_for_me: isFavorite } : s,
      ),
    );

    setFavoriteStratsTotal((prev) =>
      isFavorite ? prev + 1 : Math.max(0, prev - 1),
    );
  };

  const toggleFavorite = async (strat) => {
    try {
      const response = await api.patch(`/api/favorites/${strat.id}`);
      return response.data.isFavorite;
    } catch (err) {
      console.log(err);
    }
  };

  const toggleChangeImage = () => {
    setNewProfilImage(null);
    setChangeImage(!changeImage);
  };

  const toggleNewProfilImage = (agentData) => {
    console.log(agentData);
    setNewProfilImage([agentData]);
  };

  const validChangeProfilImage = async () => {
    try {
      console.log(newProfilImage);
      const response = await api.put("/api/change-profil-image", {
        profilImage: newProfilImage[0].iconAgent,
      });
      if (response.status == 200) {
        setProfilImage(newProfilImage[0].iconAgent);
        setLoggedUserProfilImage(newProfilImage[0].iconAgent);
        toggleChangeImage();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getProfileInfos();
    fetchAgentsList();
  }, []);

  return (
    <div className="min-h-screen text-[#ECEAE4] font-sans">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* En-tête profil */}
        <div className="flex items-start gap-5 pb-3">
          <div>
            {profilImage || newProfilImage ? (
              newProfilImage ? (
                <img src={newProfilImage[0].iconAgent} className="h-30 w-30" />
              ) : (
                <img src={profilImage} className="h-30 w-30" />
              )
            ) : (
              <div className="h-30 w-30 shrink-0 bg-[#1D2129] border border-[#2A2E37] flex items-center justify-center">
                <span className="text-[12px] text-[#5B6170]">{t("profile.avatar")}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold tracking-tight truncate">
              {username}
            </h2>
            <p className="text-[13px] text-[#8B909B] mt-0.5">
              {ownStratsTotal} {t("profile.strategiesCreated")} · {favoriteStratsTotal} {t("profile.favorites")}
            </p>

            <button
              onClick={() => setShowPassword((v) => !v)}
              hidden={showPassword}
              className="cursor-pointer mt-3 bg-[#0F1115] inline-flex items-center gap-2 text-[13px] text-[#8B909B] hover:text-[#ECEAE4] border border-[#2A2E37] hover:border-[#3A404C] px-3 py-1.5 transition-colors"
            >
              {t("profile.changePassword")}
            </button>

            <PasswordPanel open={showPassword} hidePanel={() => setShowPassword(!showPassword)} />
          </div>
        </div>
        <div>
          {changeImage && (
            <div>
              <AgentSelector
                allAgents={agentsList}
                activeAgents={newProfilImage ? newProfilImage : []}
                onSelect={toggleNewProfilImage}
              />
              <button
                onClick={() => validChangeProfilImage()}
                className="cursor-pointer mt-3 me-3 justify-center inline-flex items-center gap-2 text-[14px] text-white hover:text-black border bg-[#db9e15] hover:bg-(--main-yellow) border-[#2A2E37] hover:border-[#3A404C] px-3 py-1.5 transition-colors"
              >
                {t("common.confirm")}
              </button>
              <button
                onClick={() => toggleChangeImage()}
                className="cursor-pointer bg-[#0F1115] mt-3 justify-center inline-flex items-center gap-2 text-[14px] text-[#8B909B] hover:text-[#ECEAE4] border border-[#2A2E37] hover:border-[#3A404C] px-3 py-1.5 transition-colors"
              >
                {t("common.cancel")}
              </button>
            </div>
          )}
          <button
            hidden={changeImage}
            onClick={() => toggleChangeImage()}
            className="w-30 bg-[#0F1115] cursor-pointer mt-0 justify-center inline-flex items-center gap-2 text-[14px] text-[#8B909B] hover:text-[#ECEAE4] border border-[#2A2E37] hover:border-[#3A404C] px-3 py-1.5 transition-colors"
          >
            {t("profile.changeImage")}
          </button>
        </div>

        {/* Favoris */}
        <div className="mt-10">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-[15px] font-bold text-[#ECEAE4] tracking-tight">
              {t("profile.favoriteStrategies")}
            </h2>
            <span className="text-[12px] text-[#5B6170]">
              {favoriteStratsTotal} {t("profile.displayed")}
            </span>
            <div className="flex-1 h-px bg-[#262B34]" />
            <Link to="#" className="hover:text-(--main-yellow)">
              {t("common.showMore")}
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteStrats.map((strat) => (
              <StrategyCard
                key={"favStrat-" + strat.id}
                strat={strat}
                onClick={() => goToDetails(strat.id)}
                onToggleFavorite={() => handleFavoriteToggle(strat)}
              />
            ))}
          </div>
        </div>

        {/* Stratégies créées */}
        <div className="mt-10 mb-4">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-[15px] font-bold text-[#ECEAE4] tracking-tight">
              {t("profile.myStrategies")}
            </h2>
            <span className="text-[12px] text-[#5B6170]">
              {ownStratsTotal} {t("profile.displayed")}
            </span>
            <div className="flex-1 h-px bg-[#262B34]" />
            <Link to="#" className="hover:text-(--main-yellow)">
              {t("common.showMore")}
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {ownStrats.map((strat) => (
              <StrategyCard
                key={"ownStrat-" + strat.id}
                strat={strat}
                onClick={() => goToDetails(strat.id)}
                onToggleFavorite={() => handleFavoriteToggle(strat)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profil;
