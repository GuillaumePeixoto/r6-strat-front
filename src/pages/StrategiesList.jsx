import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./../services/api";
import StrategyFilters from "./../components/StrategyFilters";
import StrategyCard from "../components/StrategyCard";
import styles from "./../assets/styles/map-details.module.css";
import { useTranslation } from "react-i18next";
import { ToastContext } from "../context/toast.context";

function MapDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showNotif } = useContext(ToastContext);

  const [map, setMap] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [agentsList, setAgentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleFavorite = async (strat) => {
    try{
        const response = await api.patch(`/api/favorites/${strat.id}`);
        return response.data.isFavorite;
    }catch(err){
      console.error("Erreur lors de la modification du favori", err);
      showNotif(t('error.favoriteError'));
      
    }
  }

  const fetchMapDetails = async () => {
    try {
      const response = await api.get(`/api/maps/${slug}`, { params: { include: "bombSites" }});
      setMap(response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement de la map", error);
      showNotif(t('error.mapLoadError'));
      return null;
    }
  };

  const fetchAgentsList = async () => {
    try {
      const response = await api.get("/api/agents");
      setAgentsList(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des agents:", error);
      showNotif(t('error.agentsLoadError'));
    }
  };

  const fetchStrategies = async (filterData = {}) => {
    if (!map && !filterData.id_map) return;
    setIsLoading(true);

    try {
      const response = await api.get("/api/strategies", {
        params: {
          map: map?._id ?? filterData.id_map,
          search: filterData.q || "",
          site: filterData.site || "",
          agents: filterData.agents || [],
          favorites: filterData.favorite ? 1 : 0,
        },
      });

      setStrategies(response.data);
    } catch (error) {
      console.error("Erreur tactique lors de la récupération :", error);
      showNotif(t('error.strategiesLoadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const goToDetails = (id) => {
    navigate(`/strategies/${id}`);
  };

  useEffect(() => {
    const init = async () => {
      const mapData = await fetchMapDetails();
      await fetchAgentsList();
      if (mapData?._id) {
        await fetchStrategies({id_map: mapData._id});
      }
    };

    init();
  }, [slug]);

  const handleFavoriteToggle = async (strat) => {
    const isFavorite = await toggleFavorite(strat);

    setStrategies((prev) =>
      prev.map((s) =>
        s.id === strat.id ? { ...s, is_favorite_for_me: isFavorite } : s
      )
    );
  };

  if (!map) return null;

  return (
    <div className="map-detail home-container flex-1 second-bg-color">
      <div
        className={styles.heroBanner}
        style={{ backgroundImage: `url(${map.thumbnail})` }}
      >
        <div className={styles.heroOverlay}>
          <h1>{t(`map-name.${map.slug}`, { defaultValue: map.name })}</h1>
          <button
            onClick={() => navigate(`/map/${map.slug}/add`)}
            className={styles.btnCreate}
          >
            {t('strategy.create')}
          </button>
        </div>
      </div>

      <section className="p-8">
        <h2 className="text-[#db9e15] text-xl mb-6">
          {t('strategy.community')}
        </h2>

        {map.strategiesCount === 0 ? (
          <div className="text-white">
            {t('strategy.empty')}
          </div>
        ) : (
          <div>
            <div>
              <StrategyFilters
                availableSites={map.bombMapLocations}
                allAgents={agentsList}
                onFilterChange={fetchStrategies}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-[repeat(1,1fr)] md:grid-cols-[repeat(2,1fr)] lg:grid-cols-[repeat(3,1fr)] [@media(min-width:1400px)]:grid-cols-[repeat(4,1fr)] [@media(min-width:1700px)]:grid-cols-[repeat(5,1fr)] gap-5 p-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#111] border border-[#222] h-70 rounded animate-pulse"
                  >
                    <div className="h-40 bg-[#1a1a1a] mb-4"></div>
                    <div className="h-4 bg-[#1a1a1a] w-3/4 ml-4 mb-2"></div>
                    <div className="h-4 bg-[#1a1a1a] w-1/2 ml-4"></div>
                    <div className="flex row gap-3 px-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div
                          key={j}
                          className="h-10 bg-[#1a1a1a] w-1/6 mt-2 mb-1"
                        ></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(1,1fr)] md:grid-cols-[repeat(2,1fr)] lg:grid-cols-[repeat(3,1fr)] [@media(min-width:1400px)]:grid-cols-[repeat(4,1fr)] [@media(min-width:1700px)]:grid-cols-[repeat(5,1fr)] gap-5 p-3">
                {strategies.map((strat) => (
                  <StrategyCard
                    key={strat.id}
                    strat={strat}
                    canEdit={false}
                    onClick={() => goToDetails(strat.id)}
                    onToggleFavorite={() => handleFavoriteToggle(strat)}
                  />
                ))}
                {strategies.length === 0 && (
                  <div className="text-white">{t('strategy.notFound')}</div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default MapDetailPage;
