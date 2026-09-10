function StrategyControl({
  titreStrategy,
  onTitreStrategyChange,
  mapDetails,
  selectedSiteId,
  onSelectedSiteIdChange,
  reinforcementsCount,
  maxReinforcements,
  isDeleteMode,
  canAddReinforcement,
  canSave,
  onSave,
  onSpawnWall,
  onToggleDelete,
}) {
  return (
    <div className="flex flex-col mb-6">
      <div className="flex flex-row justify-between items-center">
        <input
          value={titreStrategy}
          onChange={(e) => onTitreStrategyChange(e.target.value)}
          className="second-bg-color placeholder:text-white min-w-25/100 mr-2 text-white py-1 px-2 rounded my-3 border border-[#db9e15] focus:outline-none"
          placeholder="Titre de la stratégie"
        />
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`border h-8 px-4 rounded transition ${
            canSave
              ? 'bg-[#db9e15] text-white cursor-pointer hover:bg-[#db9e15] hover:scale-105'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
          }`}
        >
          Sauvegarder
        </button>
      </div>

      <hr className="border-[#db9e15] mb-4" />

      <div className="flex justify-between items-center">
        <div className="w-1/2">
          <label className="font-bold text-[#db9e15] block mb-1 text-sm uppercase" htmlFor="selectBombSite">
            Emplacement des bombes :
          </label>
          <select
            value={selectedSiteId ?? 0}
            name="selectBombSite"
            onChange={(e) => onSelectedSiteIdChange(e.target.value)}
            className="bg-[#2a2a2a] border border-[#db9e15] p-2 rounded text-white focus:outline-none"
          >
            <option value={0}>-- Choisir un site --</option>
            {mapDetails?.bombMapLocations?.map((site) => (
              <option key={site._id} value={site._id}>
                {site.zoneName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row gap-4 items-center">
          <div className="text-center">
            <p className="text-[14px] text-[#db9e15] uppercase font-bold">Renforcements</p>
            <div className={`text-xl font-mono ${canAddReinforcement ? 'text-[#db9e15]' : 'text-red-500'}`}>
              {reinforcementsCount} / {maxReinforcements}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={onSpawnWall}
              disabled={!canAddReinforcement}
              className="px-4 py-2 bg-gray-700 text-white text-xs cursor-pointer rounded font-bold transition hover:bg-[#db9e15] disabled:opacity-50"
            >
              + Mur
            </button>
            <button
              onClick={onToggleDelete}
              className={`px-4 py-2 text-white text-[10px] cursor-pointer rounded font-bold uppercase ${
                isDeleteMode ? 'bg-red-600' : 'bg-slate-600'
              }`}
            >
              {isDeleteMode ? 'Mode Suppr ON' : 'Mode Suppr OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StrategyControl;