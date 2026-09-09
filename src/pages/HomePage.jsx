import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../assets/styles/home.component.css";
import api from '../services/api';
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t } = useTranslation();

  const [maps, setMaps] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const response = await api.get(`/api/maps`);

        if (response.status == 204) {
          setError(t("no-data-founded"));
          return;
        }

        console.log(response.data);
        setMaps(response.data);
        setError(null);
      } catch (error) {
        console.error("Erreur maps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaps();
  }, []);

  return (
    <div className={`home-container main-bg-color flex-1`}>
      <div className="home-header">
        <h1>
          SÉLECTIONNEZ UNE <span className="gold">CARTE</span>
        </h1>
        <p>{maps.length} cartes disponibles pour vos stratégies</p>
      </div>

      {error && <h4>{error}</h4>}

      {isLoading ? (
        <div className="loader">Chargement du contenu...</div>
      ) : (
        <div className="maps-grid">
          {maps.map((map) => (
            <div key={map._id} className="map-card-wrapper">
              <div
                className="map-card"
                style={{ backgroundImage: `url(${map.thumbnail})` }}
              >
                <div className="map-overlay">
                  <h2 className="map-title">{map.name}</h2>
                </div>
              </div>

              <div className="map-footer">
                <div className="map-stats">
                  <span className="count">{map.strategiesCount ?? 0}</span>
                  <span className="label">
                    STRAT{map.strategiesCount > 1 ? "S" : ""}
                  </span>
                </div>
                <Link to={`/map/${map.slug}`} className="btn-select">
                  Voir
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
