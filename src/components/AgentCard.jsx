function AgentCard({ agent, onRemove, onAddGadget, onAddUtility }) {

  return (
    <div className="agent-card border border-black">
      <div className="card-header flex flex-row justify-between">
        <div className="flex flex-row items-center text-white">
          <img src={agent.iconAgent} className="agent-mini-icon" alt={agent.name} />
          <span className="agent-name">{agent.name}</span>
        </div>
        <button className="btn-delete" onClick={() => onRemove(agent.instanceId)}>
          ❌
        </button>
      </div>

      <hr className="mb-2" />

      <div className="flex flex-row justify-center">
        <div className="gadgets-section flex flex-row">
          {agent.currentGadgets.map((gad) => (
            <div key={"gadget-"+gad._id} className="item-control mx-4 my-auto">
              <button
                className="btn-spawn flex flex-col items-center"
                onClick={() => onAddGadget(agent.instanceId, gad)}
                disabled={gad.placedCount >= gad.maxUse}
              >
                <img src={gad.iconObject} alt="" />
                <span className="text-white text-lg font-bold">
                  {gad.placedCount} / {gad.maxUse}
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="utilities-section flex flex-row">
          {agent.currentUtilities.map((ut) => (
            <div key={"utility-"+ut._id} className="item-control mx-4 my-auto">
              <button
                className="btn-spawn flex flex-col items-center"
                onClick={() => onAddUtility(agent.instanceId, ut)}
                disabled={ut.placedCount >= ut.maxUse}
              >
                <img src={ut.iconUtility} alt="" />
                <span className="text-white text-lg font-bold">
                  {ut.placedCount} / {ut.maxUse}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AgentCard;