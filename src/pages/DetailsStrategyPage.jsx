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
        console.error("Erreur lors du chargement de la stratégie", requestError);
        setError("Impossible de charger cette stratégie.");
      }
    };

    loadStrategy();
  }, [id]);

  const details = strategy?.infosStrategy || {};
  const wallCount = details.walls?.length || 0;
  const strategyAgents = useMemo(() => details.agents || [], [details.agents]);

  if (error) return <main className="p-8 text-white">{error}</main>;
  if (!strategy || !map) return <main className="p-8 text-white">Chargement...</main>;

  return (
    <main className="main-bg-color flex-1 p-4 sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to={`/map/${map.slug}`} className="text-gray-300 hover:text-[#db9e15]">
          ← Retour aux stratégies
        </Link>
        <button
          type="button"
          onClick={() => navigate(`/map/${map.slug}/add?duplicate=${strategy._id}`)}
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
            const agent = agents.find((entry) => String(entry._id) === String(savedAgent.id_agent));
            if (!agent) return null;
            return (
              <div key={String(savedAgent.id_agent)} className="flex items-center gap-3 border-b-4 bg-[#222] p-3" style={{ borderBottomColor: agent.color }}>
                <img src={agent.iconAgent} alt={agent.name} className="h-12 w-12" />
                <span>{agent.name}</span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default DetailsStrategyPage;