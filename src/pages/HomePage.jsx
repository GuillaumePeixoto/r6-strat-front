import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./../assets/styles/home.module.css";
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
    <div className={`${styles.homeContainer} flex-1`}>
      <div>
        <h1>
          SÉLECTIONNEZ UNE <span className="gold">CARTE</span>
        </h1>
        <p>{maps.length} cartes disponibles pour vos stratégies</p>
      </div>

      {error && <h4>{error}</h4>}

      {isLoading ? (
        <div className="loader">Chargement du contenu...</div>
      ) : (
        <div className={ styles.mapsGrid }>
          {maps.map((map) => (
            <div key={map._id} className={ styles.mapCardWrapper }>
              <div
                className={ styles.mapCard }
                style={{ backgroundImage: `url(${map.thumbnail})` }}
              >
                <div className={ styles.mapOverlay }>
                  <h2 className={ styles.mapTitle }>{map.name}</h2>
                </div>
              </div>

              <div className={ styles.mapFooter }>
                <div className={ styles.mapStats }>
                  <span className={ styles.stratCounter }>{map.strategiesCount ?? 0}</span>
                  <span className={ styles.label }>
                    STRAT{map.strategiesCount > 1 ? "S" : ""}
                  </span>
                </div>
                <Link to={`/map/${map.slug}`} className={ styles.btnSelect }>
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
