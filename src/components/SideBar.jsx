import AgentCard from './AgentCard';

function Sidebar({ activeAgents, onRemoveAgent, onAddGadget, onAddUtility }) {
  return (
    <div className="sidebar pe-4 h-full overflow-y-auto">
      <div id="active-agents-list" className="agent-list">
        <h2 className="font-bold text-[#db9e15] mb-3 uppercase text-sm tracking-wider">
          Liste des agents dans l'équipe
        </h2>
      </div>

      <hr className="border-[#db9e15] opacity-50 my-4" />

      {activeAgents.length > 0 ? (
        <div>
          {activeAgents.map((agent) => (
            <AgentCard
              key={agent.instanceId}
              agent={agent}
              onRemove={(id) => onRemoveAgent(id)}
              onAddGadget={(id, gad) => onAddGadget(id, gad)}
              onAddUtility={(id, ut) => onAddUtility(id, ut)}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 italic text-sm text-center mt-10">
          Aucun agent sélectionné...
        </div>
      )}
    </div>
  );
}

export default Sidebar;