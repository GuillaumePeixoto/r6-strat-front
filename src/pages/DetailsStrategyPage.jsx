import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import StrategyMap from "../components/StrategyMap";
import { AuthContext } from "../context/auth.context";
import { useTranslation } from "react-i18next";

function DetailsStrategyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loggedUserId } = useContext(AuthContext);
  const { t } = useTranslation();
  const [strategy, setStrategy] = useState(null);
  const [map, setMap] = useState(null);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadStrategy = async () => {
      try {
        const [strategyResponse, agentsResponse] = await Promise.all([
          api.get(`/api/strategies/${id}`),
          api.get("/api/agents"),
        ]);
        const loadedStrategy = strategyResponse.data;
        setStrategy(loadedStrategy);
        setMap(loadedStrategy.map);
        setAgents(agentsResponse.data);
      } catch (requestError) {
        console.error(
          "Erreur lors du chargement de la stratégie",
          requestError,
        );
        setError(t('strategy.loadError'));
      }
    };

    loadStrategy();
  }, [id]);

  const details = strategy?.infosStrategy || {};
  const wallCount = details.walls?.length || 0;
  const strategyAgents = useMemo(() => details.agents || [], [details.agents]);
  const isCreator = strategy?.user && String(strategy.user._id) === String(loggedUserId);

  const handleDelete = async () => {
    if (!window.confirm(t('strategy.deleteConfirm'))) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/strategies/${id}`);
      navigate(`/map/${map.slug}`);
    } catch (requestError) {
      console.error("Erreur lors de la suppression de la stratégie", requestError);
      setError(t('strategy.deleteError'));
      setIsDeleting(false);
    }
  };

  if (error) return <main className="p-8 text-white">{error}</main>;
  if (!strategy || !map)
    return <main className="p-8 text-white">Chargement...</main>;

  return (
    <main className="main-bg-color flex-1 p-4 sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-300 hover:text-[#db9e15]"
        >
          ← {t('common.back')}
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/map/${map.slug}/add?duplicate=${strategy._id}`)
            }
            className="border border-[#db9e15] hover:bg-[#db9e15] hover:text-white px-4 py-2 text-sm font-bold text-[#db9e15]"
          >
            📋 {t('strategy.duplicate')}
          </button>
          {isCreator && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/map/${map.slug}/add/${strategy._id}`)}
                className="border border-[#db9e15] px-4 py-2 text-sm font-bold text-[#db9e15] hover:bg-[#db9e15] hover:text-white"
              >
                ✏️ {t('strategy.edit')}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="border border-red-500 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? t('strategy.deleting') : `🗑️ ${t('strategy.delete')}`}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-white">{strategy.title}</h1>
        {strategy.user?.username && (
          <p className="text-sm text-gray-300">
            {t('strategy.createdBy')} <span className="font-semibold text-white">{strategy.user.username}</span>
          </p>
        )}
      </div>
      <StrategyMap mapDetails={{ ...map, agents }} strategy={strategy} />

      <section className="second-bg-color mt-4 p-4 text-white">
        <p className="text-sm text-gray-300">{t('strategy.reinforcedWalls')}</p>
        <p className="text-xl font-bold">{wallCount} / 10</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {strategyAgents.map((savedAgent) => {
            const agent = agents.find(
              (entry) => String(entry._id) === String(savedAgent.id_agent),
            );
            if (!agent) return null;
            let utilityUsed = {};
            if (savedAgent.utility && savedAgent.utility.length > 0) {
              utilityUsed = agent.utilities.find(
                (utility) => utility._id == savedAgent.utility[0].id_bdd,
              );
            }
            return (
              <div
                key={String(savedAgent.id_agent)}
                className="flex items-center gap-3 border-b-4 bg-[#222] p-3"
                style={{ borderBottomColor: agent.color }}
              >
                <div>
                  <img
                    src={agent.iconAgent}
                    alt={agent.name}
                    className="h-12 w-12 mx-auto"
                  />
                  <p className="text-center">{agent.name}</p>
                </div>
                {savedAgent.gadgets && savedAgent.gadgets.length > 0 && (
                  <div className="flex flex-col justify-center items-center stat-item">
                    <p className="stat-label text-gray-400 text-[10px]">
                      {t('strategy.gadgets')}
                    </p>
                    <p className="stat-value font-mono text-white">
                      {savedAgent.gadgets &&
                        savedAgent.gadgets.length > 0 &&
                        savedAgent.gadgets.length +
                          " / " +
                          agent.agentObject[0].maxUse}
                    </p>
                    <div
                      className="flex items-center justify-center bg-black h-8 w-8 mt-1 rounded-2xl border-2 "
                      style={{ borderColor: agent.color }}
                    >
                      <img
                        className="w-4/5 h-4/5 object-contain"
                        src={agent.agentObject[0].iconObject}
                        alt="logo gadget"
                      />
                    </div>
                  </div>
                )}
                {savedAgent.utility && savedAgent.utility.length > 0 && (
                  <div className="flex flex-col justify-center items-center stat-item">
                    <span className="stat-label text-gray-400 text-[10px]">
                      {t('strategy.utilities')}
                    </span>
                    <span className="stat-value font-mono text-white">
                      {savedAgent.utility &&
                        savedAgent.utility.length > 0 &&
                        savedAgent.utility.length + " / " + utilityUsed?.maxUse}
                    </span>
                    <div
                      className="flex items-center justify-center bg-white h-8 w-8 mt-1 rounded-2xl border-2 "
                      style={{ borderColor: agent.color }}
                    >
                      <img
                        className="w-4/5 h-4/5 object-contain"
                        src={utilityUsed?.iconUtility}
                        alt="logo gadget"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default DetailsStrategyPage;
