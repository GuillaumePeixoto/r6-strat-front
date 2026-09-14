import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import StrategyMap from "../components/StrategyMap";

function DetailsStrategyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState(null);
  const [map, setMap] = useState(null);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);

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
        setError("Impossible de charger cette stratégie.");
      }
    };

    loadStrategy();
  }, [id]);

  const details = strategy?.infosStrategy || {};
  const wallCount = details.walls?.length || 0;
  const strategyAgents = useMemo(() => details.agents || [], [details.agents]);

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
          ← Revenir en arrière
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(`/map/${map.slug}/add?duplicate=${strategy._id}`)
          }
          className="border border-[#db9e15] px-4 py-2 text-sm font-bold text-[#db9e15]"
        >
          Dupliquer la stratégie
        </button>
      </div>

      <h1 className="mb-4 text-2xl font-bold text-white">{strategy.title}</h1>
      <StrategyMap mapDetails={{ ...map, agents }} strategy={strategy} />

      <section className="second-bg-color mt-4 p-4 text-white">
        <p className="text-sm text-gray-300">Murs renforcés</p>
        <p className="text-xl font-bold">{wallCount} / 10</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {strategyAgents.map((savedAgent) => {
            const agent = agents.find(
              (entry) => String(entry._id) === String(savedAgent.id_agent),
            );
            if (!agent) return null;
            console.log("agent", agent);
            console.log("savedAgent", savedAgent);
            let utilityUsed = {};
            if (savedAgent.utility && savedAgent.utility.length > 0) {
              utilityUsed = agent.utilities.find(
                (utility) => utility._id == savedAgent.utility[0].id_bdd,
              );
              console.log(utilityUsed);
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
                      GADGETS
                    </p>
                    <p className="stat-value font-mono text-white">
                      {savedAgent.gadgets &&
                        savedAgent.gadgets.length > 0 &&
                        savedAgent.gadgets.length +
                          " / " +
                          agent.agentObject[0].maxUse}
                    </p>
                    <div
                      className="flex items-center justify-center bg-black h-8 w-8 rounded-2xl border-2 "
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
                      UTILITAIRES
                    </span>
                    <span className="stat-value font-mono text-white">
                      {savedAgent.utility &&
                        savedAgent.utility.length > 0 &&
                        savedAgent.utility.length + " / " + utilityUsed?.maxUse}
                    </span>
                    <div
                      className="flex items-center justify-center bg-white h-8 w-8 rounded-2xl border-2 "
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
