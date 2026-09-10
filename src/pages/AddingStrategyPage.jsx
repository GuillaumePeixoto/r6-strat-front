import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet/dist/leaflet.css";
import api from "../services/api";
import AgentSelector from "../components/AgentSelector";
import StrategyControl from "../components/StrategyControl";
import Sidebar from "../components/Sidebar";

const MAX_REINFORCEMENTS = 10;

function StrategyMapPage() {
  const { slug, id: editIdParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get("duplicate");

  // --- Refs (objets Leaflet, pas affichés directement dans le JSX) ---
  const mapContainerRef = useRef(null); // équivalent du ref="mapContainer" sur la div
  const mapRef = useRef(null); // l'instance Leaflet elle-même
  const bombMarkersRef = useRef([]);
  const mapMarkersRef = useRef({});
  const nextIdRef = useRef(0);

  // --- State (données affichées / qui doivent déclencher un re-render) ---
  const [mapDetails, setMapDetails] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [titreStrategy, setTitreStrategy] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [activeAgents, setActiveAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [strategyElements, setStrategyElements] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // --- Valeurs dérivées (computed) ---
  const reinforcementsCount = useMemo(
    () => strategyElements.filter((el) => el.type === "reinforcement").length,
    [strategyElements],
  );

  const canSave = useMemo(() => {
    const hasSite = selectedSiteId !== null && selectedSiteId != "";
    const hasAgents = activeAgents.length > 0;
    return hasSite && hasAgents;
  }, [selectedSiteId, activeAgents]);

  const canAddReinforcement = useMemo(
    () => reinforcementsCount < MAX_REINFORCEMENTS,
    [reinforcementsCount],
  );

  const spawnWallElement = (position = null) => {
    if (!canAddReinforcement) {
      alert("Limite de 10 renforcements atteinte !");
      return;
    }

    const id = Date.now();
    const iconUrl = `/images/icon_utilities/bulletproof_wall.png`;

    const icon = L.icon({
      iconUrl,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const center = position
      ? L.latLng(position.lat, position.lng)
      : mapRef.current.getCenter();

    const marker = L.marker(center, {
      draggable: true,
      icon,
      customType: "reinforcement",
      zIndexOffset: -900,
      customId: id,
    }).addTo(mapRef.current);

    marker.on("dragend", () => {
      const newPos = marker.getLatLng();
      setStrategyElements((prev) =>
        prev.map((el) =>
          el.id === marker.options.customId
            ? { ...el, y: Math.round(newPos.lat), x: Math.round(newPos.lng) }
            : el,
        ),
      );
    });

    marker.on("click", (e) => {
      if (!isDeleteModeRef.current) return; // 👈 lecture via la ref, pas le state directement
      L.DomEvent.stopPropagation(e);

      const targetId = marker.options.customId;
      mapRef.current.removeLayer(marker);
      setStrategyElements((prev) => prev.filter((el) => el.id !== targetId));
    });

    setStrategyElements((prev) => [
      ...prev,
      {
        id,
        type: "reinforcement",
        y: Math.round(center.lat),
        x: Math.round(center.lng),
        instance: marker,
      },
    ]);
  };

  const addAgentFromIcon = (agentData) => {
    const instanceId = ++nextIdRef.current;

    const alreadyExists = activeAgents.some((a) => a.id === agentData.id);
    if (alreadyExists) {
      alert(`${agentData.name} est déjà sur la carte !`);
      return;
    }

    if (activeAgents.length >= 5) {
      alert("Action impossible : Une escouade ne peut pas dépasser 5 agents.");
      return;
    }

    const newAgentEntry = {
      ...agentData,
      instanceId,
      currentUtilities: agentData.utilities.map((u) => ({
        ...u,
        placedCount: 0,
      })),
      currentGadgets: agentData.agentObject
        ? agentData.agentObject.map((g) => ({ ...g, placedCount: 0 }))
        : [],
    };

    setActiveAgents((prev) => [...prev, newAgentEntry]);
    spawnAgentOnMap(agentData, instanceId);
  };

  const spawnAgentOnMap = (agentData, instanceId, position = null) => {
    const icon = L.icon({
      iconUrl: `${agentData.iconAgent}`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      className: "",
    });

    const pos = position
      ? L.latLng(position.lat, position.lng)
      : mapRef.current.getCenter();

    const marker = L.marker(pos, { icon, draggable: true }).addTo(
      mapRef.current,
    );

    mapMarkersRef.current[instanceId] = {
      agentMarker: marker,
      utilityMarkers: [],
      gadgetMarkers: [],
    };
  };

  const removeAgentInstance = (instanceId) => {
    const markers = mapMarkersRef.current[instanceId];
    if (markers) {
      markers.agentMarker.remove();
      markers.utilityMarkers.forEach((m) => m.instance.remove());
      markers.gadgetMarkers.forEach((m) => m.instance.remove());
      delete mapMarkersRef.current[instanceId];
    }

    setActiveAgents((prev) => prev.filter((a) => a.instanceId !== instanceId));
  };

  const addUtilityToMap = (instanceId, utility, position = null) => {
    const agent = activeAgents.find((a) => a.instanceId === instanceId);
    if (!agent) return;

    const targetUtil = agent.currentUtilities.find((u) => u.id === utility.id);
    const otherUtilsWithMarkers = agent.currentUtilities.filter(
      (u) => u._id !== utility._id && u.placedCount > 0,
    );

    if (otherUtilsWithMarkers.length > 0) {
      mapMarkersRef.current[instanceId].utilityMarkers.forEach((m) =>
        m.instance.remove(),
      );
      mapMarkersRef.current[instanceId].utilityMarkers = [];
    }

    if (targetUtil.placedCount >= utility.maxUse) {
      alert("Limite atteinte !");
      return;
    }

    const icon = L.divIcon({
      html: `
      <div class="marker-bg-circle bg-white" style="border:2px solid ${agent.color}">
        <img src="${utility.iconUtility}" class="utility-img" />
      </div>
    `,
      className: "custom-leaflet-marker",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const pos = position
      ? L.latLng(position.lat, position.lng)
      : mapRef.current.getCenter();
    const marker = L.marker(pos, { icon, draggable: true }).addTo(
      mapRef.current,
    );
    marker.options.id_bdd = utility._id;

    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
    <div class="text-center">
      <button class="text-white text-[10px] px-2 py-1 font-bold">❌</button>
    </div>
  `;
    const deleteBtn = popupContent.querySelector("button");
    deleteBtn.onclick = () => {
      mapMarkersRef.current[instanceId].utilityMarkers = mapMarkersRef.current[
        instanceId
      ].utilityMarkers.filter((m) => m.instance !== marker);
      marker.remove();

      setActiveAgents((prev) =>
        prev.map((a) =>
          a.instanceId === instanceId
            ? {
                ...a,
                currentUtilities: a.currentUtilities.map((u) =>
                  u._id === utility._id
                    ? { ...u, placedCount: u.placedCount - 1 }
                    : u,
                ),
              }
            : a,
        ),
      );
    };
    marker.bindPopup(popupContent, { className: "w-10 m-0", minWidth: 30, maxWidth: 30, closeButton: false });

    mapMarkersRef.current[instanceId].utilityMarkers.push({
      id_bdd: targetUtil._id,
      instance: marker,
    });

    // Reset des autres compteurs (switch) + incrément du nouveau, en une seule mise à jour immuable
    setActiveAgents((prev) =>
      prev.map((a) =>
        a.instanceId === instanceId
          ? {
              ...a,
              currentUtilities: a.currentUtilities.map((u) => {
                if (u._id === utility._id)
                  return { ...u, placedCount: u.placedCount + 1 };
                if (otherUtilsWithMarkers.length > 0)
                  return { ...u, placedCount: 0 };
                return u;
              }),
            }
          : a,
      ),
    );
  };

  const addGadgetToMap = (instanceId, gadget, position = null) => {
    const agent = activeAgents.find((a) => a.instanceId === instanceId);
    if (!agent) {
      console.error("Agent introuvable pour l'instance :", instanceId);
      return;
    }

    const targetGadget = agent.currentGadgets.find((g) => g.id === gadget.id);
    if (targetGadget.placedCount >= targetGadget.maxUse) {
      console.warn("Limite atteinte pour ce gadget");
      return;
    }

    const gadgetIcon = L.divIcon({
      html: `
      <div class="marker-bg-circle bg-black" style="border:2px solid ${agent.color}">
        <img src="${gadget.iconObject}" class="gadget-img" />
      </div>
    `,
      className: "custom-leaflet-marker",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const pos = position
      ? L.latLng(position.lat, position.lng)
      : mapRef.current.getCenter();
    const markerG = L.marker(pos, { icon: gadgetIcon, draggable: true }).addTo(
      mapRef.current,
    );

    const popupContent = document.createElement("div");
    popupContent.innerHTML = `
    <div class="text-center">
      <button class="text-white text-[10px] px-2 py-1 font-bold">❌</button>
    </div>
  `;
    const deleteBtn = popupContent.querySelector("button");
    deleteBtn.onclick = () => {
      if (mapMarkersRef.current[instanceId]) {
        mapMarkersRef.current[instanceId].gadgetMarkers = mapMarkersRef.current[
          instanceId
        ].gadgetMarkers.filter((m) => m.instance !== markerG);
      }
      markerG.remove();

      setActiveAgents((prev) =>
        prev.map((a) =>
          a.instanceId === instanceId
            ? {
                ...a,
                currentGadgets: a.currentGadgets.map((g) =>
                  g._id === gadget._id
                    ? { ...g, placedCount: g.placedCount - 1 }
                    : g,
                ),
              }
            : a,
        ),
      );
    };
    markerG.bindPopup(popupContent, { minWidth: 20, closeButton: false });

    if (mapMarkersRef.current[instanceId]) {
      mapMarkersRef.current[instanceId].gadgetMarkers.push({
        id_bdd: gadget._id,
        instance: markerG,
      });
    }

    setActiveAgents((prev) =>
      prev.map((a) =>
        a.instanceId === instanceId
          ? {
              ...a,
              currentGadgets: a.currentGadgets.map((g) =>
                g._id === gadget._id
                  ? { ...g, placedCount: g.placedCount + 1 }
                  : g,
              ),
            }
          : a,
      ),
    );
  };

  const updateBombMarkers = () => {
    bombMarkersRef.current.forEach((m) => m.remove());
    bombMarkersRef.current = [];

    const site = mapDetails?.bombMapLocations.find(
      (s) => s._id === selectedSiteId,
    );
    if (!site) return;

    const bombIconA = L.icon({
      iconUrl: `/images/icon_bomb/A-bomb.png`,
      iconSize: [24, 35],
      iconAnchor: [12, 17.5],
    });
    const bombIconB = L.icon({
      iconUrl: `/images/icon_bomb/B-bomb.png`,
      iconSize: [24, 35],
      iconAnchor: [12, 17.5],
    });

    const markerA = L.marker([site.siteA.y, site.siteA.x], {
      icon: bombIconA,
      zIndexOffset: -1000,
    }).addTo(mapRef.current);
    const markerB = L.marker([site.siteB.y, site.siteB.x], {
      icon: bombIconB,
      zIndexOffset: -1000,
    }).addTo(mapRef.current);

    bombMarkersRef.current.push(markerA, markerB);
    mapRef.current.flyTo([site.siteA.y, site.siteA.x], 0);
  };

  // Équivalent du watch(selectedSiteId, updateBombMarkers)
  useEffect(() => {
    if (mapRef.current && mapDetails) {
      updateBombMarkers();
    }
  }, [selectedSiteId]);

  const fetchMapDetails = async (details) => {

    try {
      const h = 900;
      const w = 1600 * details.floorCount;

      const imageUrl = `${details.imagePath}`;
      const imageBounds = [
        [0, 0],
        [h, w],
      ];

      L.imageOverlay(imageUrl, imageBounds).addTo(mapRef.current);
      mapRef.current.fitBounds(imageBounds);
      mapRef.current.setMaxBounds(imageBounds);
      mapRef.current.fitBounds(imageBounds);
    } catch (error) {
      console.error("Erreur lors du chargement de la map", error);
    }
  };

  const fetchData = async () => {
    try {
      const [mapRes, agentsRes] = await Promise.all([
        api.get(`/api/maps/${slug}`, { params: { include: "bombSites" }}),
        api.get("/api/agents"),
      ]);
      setMapDetails(mapRes.data);
      setAllAgents(agentsRes.data);

      return { mapData: mapRes.data, agentsData: agentsRes.data }; // 👈 ajouté
    } catch (error) {
      console.error("Erreur de chargement", error);
      return { mapData: null, agentsData: [] };
    }
  };

  const hydrateStrategy = async (id, isDuplicate = false, agentsData = []) => {
    try {
      const response = await api.get(`/strategy/${id}`);
      const data = response.data;

      setSelectedSiteId(String(data.bombsite.id));
      setTitreStrategy(isDuplicate ? `${data.title} - Copie` : data.title);

      for (const savedAgent of data.detail_strategy.agents) {
        const agentData = agentsData.find((a) => a.id === savedAgent.id_agent);
        if (!agentData) {
          console.warn(
            `Agent ID ${savedAgent.id_agent} non trouvé dans la liste globale.`,
          );
          continue;
        }

        const instanceId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

        const newAgentEntry = {
          ...agentData,
          instanceId,
          currentUtilities: (agentData.utilities || []).map((u) => ({
            ...u,
            placedCount: 0,
          })),
          currentGadgets: (agentData.agentObject || []).map((g) => ({
            ...g,
            placedCount: 0,
          })),
        };

        setActiveAgents((prev) => [...prev, newAgentEntry]);

        spawnAgentOnMap(agentData, instanceId, {
          lat: savedAgent.y,
          lng: savedAgent.x,
        });

        if (savedAgent.agentObject) {
          for (const g of savedAgent.agentObject) {
            const gadgetData = agentData.agentObject?.find(
              (ag) => ag._id === g.id_bdd,
            );
            if (gadgetData) {
              addGadgetToMap(instanceId, gadgetData, { lat: g.y, lng: g.x });
            }
          }
        }

        if (savedAgent.utility) {
          for (const u of savedAgent.utility) {
            const utilityData = agentData.utilities?.find(
              (au) => au._id === u.id_bdd,
            );
            if (utilityData) {
              addUtilityToMap(instanceId, utilityData, { lat: u.y, lng: u.x });
            }
          }
        }
      }

      if (data.detail_strategy.walls) {
        data.detail_strategy.walls.forEach((w) => {
          spawnWallElement({ lat: w.y, lng: w.x });
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'hydratation :", err);
    }
  };

  const isDeleteModeRef = useRef(isDeleteMode);
  useEffect(() => {
    isDeleteModeRef.current = isDeleteMode;
  }, [isDeleteMode]);

  useEffect(() => {
    mapRef.current = L.map(mapContainerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 2,
      zoomAnimation: false,
    });

    const init = async () => {
      const { mapData, agentsData } = await fetchData();
      if (mapData) fetchMapDetails(mapData);

      if (editIdParam) {
        setEditMode(true);
        setEditId(editIdParam);
        await hydrateStrategy(editIdParam, false, agentsData);
      } else if (duplicateId) {
        await hydrateStrategy(duplicateId, true, agentsData);
      }
    };

    init();

    const updateZoomVar = () => {
      const zoom = mapRef.current.getZoom();
      mapRef.current.getContainer().style.setProperty("--map-zoom", zoom);
    };

    mapRef.current.on("zoomend", updateZoomVar);
    updateZoomVar();

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  const generateSaveData = () => {
    const saveFormat = {
      title: titreStrategy,
      map_id: mapDetails._id,
      bombsite: selectedSiteId ? selectedSiteId : "",
      walls: [],
      agents: [],
    };

    // 1. Les murs
    strategyElements.forEach((el) => {
      if (el.type === "reinforcement") {
        saveFormat.walls.push({ x: el.x, y: el.y });
      }
    });

    // 2. Les agents actifs
    activeAgents.forEach((agent) => {
      const agentInstance = mapMarkersRef.current[agent.instanceId];
      if (!agentInstance) return;

      const agentData = {
        id_agent: agent._id,
        x: agentInstance.agentMarker.getLatLng().lng,
        y: agentInstance.agentMarker.getLatLng().lat,
        gadgets: [],
        utility: [],
      };

      if (agentInstance.utilityMarkers?.length > 0) {
        agentInstance.utilityMarkers.forEach((g) => {
          agentData.utility.push({
            id_bdd: g.id_bdd,
            type: "utility",
            x: g.instance.getLatLng().lng,
            y: g.instance.getLatLng().lat,
          });
        });
      }

      if (agentInstance.gadgetMarkers?.length > 0) {
        agentInstance.gadgetMarkers.forEach((g) => {
          agentData.gadgets.push({
            id_bdd: g.id_bdd,
            type: "gadget",
            x: g.instance.getLatLng().lng,
            y: g.instance.getLatLng().lat,
          });
        });
      }

      saveFormat.agents.push(agentData);
    });
    console.log('saveFormat',saveFormat);
    return saveFormat;
  };

  const saveToDatabase = async () => {
    const data = generateSaveData();

    try {
        if(editMode){
            const response = await api.put(`/api/strategy/${editId}`, data);
            console.log(response);
            navigate(`/map/${slug}`)
            return;
        }

        const response = await api.post("/api/save-strategy", data);
        console.log(response);
        navigate(`/map/${slug}`)
    } catch (err) {
      console.error("Erreur de sauvegarde", err);
    }
  };

  return (
    <div className="px-8 main-bg-color flex-1">
      <StrategyControl
        titreStrategy={titreStrategy}
        onTitreStrategyChange={setTitreStrategy}
        mapDetails={mapDetails}
        selectedSiteId={selectedSiteId}
        onSelectedSiteIdChange={setSelectedSiteId}
        reinforcementsCount={reinforcementsCount}
        maxReinforcements={MAX_REINFORCEMENTS}
        isDeleteMode={isDeleteMode}
        canAddReinforcement={canAddReinforcement}
        canSave={canSave}
        onSave={saveToDatabase}
        onSpawnWall={() => spawnWallElement()}
        onToggleDelete={() => setIsDeleteMode((prev) => !prev)}
      />

      <div className="my-4 flex flex-row gap-2">
        <Sidebar
          activeAgents={activeAgents}
          onRemoveAgent={removeAgentInstance}
          onAddGadget={addGadgetToMap}
          onAddUtility={addUtilityToMap}
        />

        <div className="mapside">
          <div
            ref={mapContainerRef}
            className="h-175 w-full border-2 border-[#db9e15]"
          ></div>
        </div>
      </div>

      <div className="agent-selector-container">
        <AgentSelector
          allAgents={allAgents}
          activeAgents={activeAgents}
          onSelect={addAgentFromIcon}
        />
      </div>
    </div>
  );
}

export default StrategyMapPage;
