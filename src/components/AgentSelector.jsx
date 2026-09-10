function AgentSelector({ allAgents, activeAgents, onSelect }) {
  const isAgentActive = (agentId) => {
    return activeAgents.some((agent) => agent.id === agentId);
  };

  return (
    <div className="agent-selector-container">
      <h3 className="text-white uppercase text-sm tracking-widest">Choisir un Agent</h3>

      <div className="grid grid-cols-[repeat(auto-fill,80px)] my-4 gap-y-4" style={{ rowGap: '15px' }}>
        {allAgents.map((agent) => (
          <div
            key={agent.id}
            className={`transition-all duration-300 hover:scale-110 flex flex-col items-center justify-center cursor-pointer ${
              isAgentActive(agent.id) ? 'is-active opacity-50' : ''
            }`}
            onClick={() => onSelect(agent)}
          >
            <div className="icon-wrapper w-17.5">
              <img src={agent.iconAgent} alt={agent.name} />
            </div>
            <span className="agent-name text-white text-center w-1/1 truncate">{agent.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AgentSelector;