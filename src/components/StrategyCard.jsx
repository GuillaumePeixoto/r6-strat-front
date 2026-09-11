function StrategyCard({ strat, canEdit = false, onClick, onEdit, onDelete, onToggleFavorite }) {
  return (
    <div
      onClick={() => onClick(strat)}
      className="bg-[#1a1a1a] border border-gray-800 hover:border-[#db9e15] transition-all group cursor-pointer overflow-hidden rounded shadow-lg"
    >
      <div className="h-40 bg-gray-900 relative">
        <img
          src={`${strat.map_thumbnail}`}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
          alt={strat.map_name}
        />

        <div className="absolute bottom-2 left-2 bg-[#db9e15] text-black text-[10px] font-bold px-2 py-1 uppercase">
          {strat.map_name}
        </div>

        {canEdit && (
          <div className="absolute top-2 right-2 flex gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(strat);
              }}
              className="bg-[#db9e15]/80 hover:bg-[#db9e15] text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-xl"
              title="Modifier"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(strat.id);
              }}
              className="bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-xl"
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(strat);
          }}
          className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
            strat.is_favorite_for_me ? 'bg-yellow-500 text-black' : 'bg-black/50 text-white'
          }`}
          title={strat.is_favorite_for_me ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-bold uppercase mb-1 truncate text-white">{strat.title}</h3>
        <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-mono">
          <span className="text-[#db9e15] text-xs">{strat.bombsite_name}</span>
        </div>
        <div className="flex flex-row gap-1">
          {strat.agents.map((agent) => (
            <img key={agent.name} src={agent.icon} title={agent.name} className="mini-icon" alt={agent.name} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default StrategyCard;