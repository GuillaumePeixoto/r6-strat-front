import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const WALL_ICON = "/images/icon_utilities/bulletproof_wall.png";

const toNumber = (value) => Number(value) || 0;

function StrategyMap({ mapDetails, strategy }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !mapDetails || !strategy) return undefined;

    const map = L.map(containerRef.current, {
      crs: L.CRS.Simple,
      minZoom: -1,
      maxZoom: 2,
      zoomAnimation: false,
    });
    mapRef.current = map;

    const height = 900;
    const width = 1600 * (mapDetails.floorCount || 1);
    const bounds = [[0, 0], [height, width]];

    L.imageOverlay(mapDetails.imagePath, bounds).addTo(map);
    map.fitBounds(bounds);
    map.setMaxBounds(bounds);

    const details = strategy.infosStrategy || strategy.detail_strategy || {};
    const agents = details.agents || [];
    const availableAgents = mapDetails.agents || [];
    const findAgent = (id) => availableAgents.find(
      (agent) => String(agent._id || agent.id) === String(id),
    );

    const wallIcon = L.divIcon({
      className: "r6-marker-container wall-marker",
      html: `<div class="marker-wall-item"><img src="${WALL_ICON}" class="wall-img" alt="" /></div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    (details.walls || []).forEach((wall) => {
      L.marker([toNumber(wall.y), toNumber(wall.x)], {
        icon: wallIcon,
        zIndexOffset: -900,
      }).addTo(map);
    });

    const bombsite = strategy.bombSiteLocation || strategy.bombsite;
    if (bombsite?.siteA && bombsite?.siteB) {
      [
        ["A", bombsite.siteA],
        ["B", bombsite.siteB],
      ].forEach(([label, position]) => {
        const icon = L.icon({
          iconUrl: `/images/icon_bomb/${label}-bomb.png`,
          iconSize: [24, 35],
          iconAnchor: [12, 17],
        });
        L.marker([toNumber(position.y), toNumber(position.x)], {
          icon,
          zIndexOffset: -1000,
        }).addTo(map);
      });
    }

    agents.forEach((savedAgent) => {
      const agent = findAgent(savedAgent.id_agent || savedAgent.agent);
      if (!agent) return;

      const color = agent.color || "#f0ad1a";
      const agentIcon = L.icon({
        iconUrl: agent.iconAgent || agent.agent_icon,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([toNumber(savedAgent.y), toNumber(savedAgent.x)], {
        icon: agentIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      const addEquipment = (items, type) => {
        (items || []).forEach((item) => {
          const equipment = type === "gadget"
            ? (agent.agentObject || []).find((entry) => String(entry._id) === String(item.id_bdd))
            : (agent.utilities || []).find((entry) => String(entry._id) === String(item.id_bdd));
          if (!equipment) return;

          const iconPath = type === "gadget" ? equipment.iconObject : equipment.iconUtility;
          const icon = L.divIcon({
            className: "custom-leaflet-marker",
            html: `<div class="marker-bg-circle ${type === "gadget" ? "bg-black" : "bg-white"}" style="border:2px solid ${color}"><img src="${iconPath}" class="${type === "gadget" ? "gadget-img" : "utility-img"}" alt="" /></div>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          L.marker([toNumber(item.y), toNumber(item.x)], { icon }).addTo(map);
        });
      };

      addEquipment(savedAgent.gadgets, "gadget");
      addEquipment(savedAgent.utility || savedAgent.utilities, "utility");
    });

    const updateZoom = () => {
      map.getContainer().style.setProperty("--map-zoom", map.getZoom());
    };
    map.on("zoomend", updateZoom);
    updateZoom();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapDetails, strategy]);

  return <div ref={containerRef} className="h-175 w-full border-2 border-[#db9e15]" />;
}

export default StrategyMap;