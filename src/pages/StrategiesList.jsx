import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../assets/styles/strategies-list.component.css";

function StrategiesList() {
    const { slugMap } = useParams();
    const [map, setMap] = useState(null);
    const [agents, setAgents] = useState([]);
    const [strategies, setStrategies] = useState([]);
    const [filters, setFilters] = useState({ search: "", site: "", agents: [], favorites: false });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadStrategies = useCallback(async (mapId, currentFilters) => {
        setIsLoading(true);

        try {
            const response = await api.get(`/api/strategies`, {
                params: {
                    search: currentFilters.search,
                    site: currentFilters.site,
                    agents: currentFilters.agents.join(","),
                    favorites: currentFilters.favorites ? 1 : 0,
                    map: mapId
                },
            });

            setStrategies(response.data);
        } catch (requestError) {
            console.error("Erreur lors du chargement des stratégies", requestError);
            setError(requestError.response?.data?.errorMessage || "Impossible de charger les stratégies.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadPage = async () => {
            try {
                const [mapResponse, agentsResponse] = await Promise.all([
                    api.get(`/api/maps/${slugMap}`, { params: { include: "bombSites" } }),
                    api.get("/api/agents"),
                ]);

                setMap(mapResponse.data);
                setAgents(agentsResponse.data);
                await loadStrategies(mapResponse.data._id, { search: "", site: "", agents: [], favorites: false });
            } catch (requestError) {
                console.error("Erreur lors du chargement de la map", requestError);
                setError(requestError.response?.data?.errorMessage || "Impossible de charger la carte.");
                setIsLoading(false);
            }
        };

        loadPage();
    }, [loadStrategies, slugMap]);

    const updateFilter = (name, value) => {
        const nextFilters = { ...filters, [name]: value };
        setFilters(nextFilters);
        if (map) loadStrategies(map._id, nextFilters);
    };

    const toggleFavorite = async (strategy) => {
        const method = strategy.isFavorite ? "delete" : "post";
        await api[method](`/api/strategies/${strategy._id}/favorite`);
        const nextFilters = { ...filters };
        await loadStrategies(map._id, nextFilters);
    };

    if (error && !map) return <main className="strategies-page"><p>{error}</p></main>;
    if (!map) return <main className="strategies-page"><p>Chargement...</p></main>;

    return (
        <main className="strategies-page">
            <section className="strategy-hero" style={{ backgroundImage: `url(${map.imagePath})` }}>
                <div className="strategy-hero-overlay">
                    <h1>{map.name}</h1>
                    <Link to={`/map/${map.slug}/add`} className="create-strategy">+ Créer une stratégie</Link>
                </div>
            </section>
            <section className="strategy-content">
                <h2>Stratégies de la communauté</h2>
                <div className="strategy-filters">
                    <input type="search" placeholder="Rechercher..." value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
                    <select value={filters.site} onChange={(event) => updateFilter("site", event.target.value)}>
                        <option value="">Tous les sites</option>
                        {map.bombMapLocations?.map((site) => <option key={site._id} value={site.zoneName}>{site.zoneName}</option>)}
                    </select>
                    <select value={filters.agents[0] || ""} onChange={(event) => updateFilter("agents", event.target.value ? [event.target.value] : [])}>
                        <option value="">Tous les agents</option>
                        {agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name}</option>)}
                    </select>
                    <label><input type="checkbox" checked={filters.favorites} onChange={(event) => updateFilter("favorites", event.target.checked)} /> Favoris</label>
                </div>
                {error && <p>{error}</p>}
                {isLoading ? <div className="strategy-grid">{Array.from({ length: 6 }, (_, index) => <div className="strategy-card skeleton" key={index} />)}</div> : (
                    <div className="strategy-grid">
                        {strategies.map((strategy) => (
                            <article className="strategy-card" key={strategy._id}>
                                <button className="favorite-button" onClick={() => toggleFavorite(strategy)} aria-label="Ajouter ou retirer des favoris">{strategy.isFavorite ? "★" : "☆"}</button>
                                <h3>{strategy.title}</h3>
                                <p>{strategy.bombSiteLocation?.zoneName || "Site non renseigné"}</p>
                                <div className="agent-list">{strategy.agents.map((agent) => <span key={agent._id}>{agent.name}</span>)}</div>
                            </article>
                        ))}
                        {!strategies.length && <p>Aucune stratégie trouvée.</p>}
                    </div>
                )}
            </section>
        </main>
    );
}

export default StrategiesList;