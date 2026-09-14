import { useState } from 'react';
import Select, { components } from 'react-select';

const MAX_AGENTS = 5;

const CustomOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <img src={props.data.iconAgent} className="w-8 h-8 bg-black border border-gray-600" alt="" />
      <span className="text-xs uppercase font-bold">{props.data.name}</span>
    </div>
  </components.Option>
);

const CustomMultiValue = (props) => (
  <span className="inline-flex items-center bg-[#db9e15] text-black text-[10px] font-black px-2 py-0.5 rounded mr-1 uppercase">
    <img src={props.data.iconAgent} className="w-8 h-8 bg-black border border-gray-600" alt="" />
    <span className="ml-1 text-[20px] cursor-pointer" onClick={() => props.removeProps.onClick()}>
      ×
    </span>
  </span>
);

const customStyles = {
  control: (base) => ({
    ...base,
    background: '#000',
    borderColor: '#333',
    minHeight: '53px',
  }),
  menu: (base) => ({
    ...base,
    background: '#1a1a1a',
    borderColor: '#333',
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? '#db9e15' : '#1a1a1a',
    color: state.isFocused ? 'black' : 'white',
  }),
  input: (base) => ({ ...base, color: 'white' }),
  singleValue: (base) => ({ ...base, color: 'white' }),
  placeholder: (base) => ({ ...base, color: '#666' }),
};

function StrategyFilters({ availableSites = [], allAgents = [], onFilterChange }) {
  const [filters, setFilters] = useState({
    q: '',
    agents: [],
    site: '',
    favorite: false,
  });

  const triggerUpdate = () => {
    const payload = {
      ...filters,
      agents: filters.agents.map((a) => a.id),
    };
    onFilterChange(payload);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-[#0f0f0f] p-4 border border-[#2a2a2a] rounded shadow-2xl items-end">
      <div className="flex-1 w-full">
        <label className="text-[10px] uppercase font-black text-gray-500 mb-1 block">Nom de la stratégie</label>
        <input
          type="text"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Ex: Defense Full Electric..."
          className="w-full h-13.25 bg-black border border-[#333] p-2 text-white text-sm focus:border-[#db9e15] outline-none transition rounded"
        />
      </div>

      <div className="flex-1 w-full custom-r6-multiselect">
        <label className="text-[10px] uppercase font-black text-gray-500 mb-1 block">Agents impliqués</label>
        <Select
          isMulti
          closeMenuOnSelect={false}
          isSearchable={false}
          placeholder=""
          options={allAgents}
          value={filters.agents}
          onChange={(selected) => setFilters({ ...filters, agents: selected || [] })}
          getOptionValue={(option) => option.id}
          getOptionLabel={(option) => option.name}
          isOptionDisabled={() => filters.agents.length >= MAX_AGENTS}
          components={{ Option: CustomOption, MultiValue: CustomMultiValue }}
          styles={customStyles}
          noOptionsMessage={() =>
            filters.agents.length >= MAX_AGENTS ? (
              <div className="text-xs font-black uppercase text-[#db9e15] p-2 bg-black text-center">
                Escouade complète (Maximum 5 agents)
              </div>
            ) : (
              'Aucune option'
            )
          }
        />
      </div>

      <div className="w-full lg:w-48">
        <label className="text-[10px] uppercase font-black text-gray-500 mb-1 block">Site de bombe</label>
        <select
          value={filters.site}
          onChange={(e) => setFilters({ ...filters, site: e.target.value })}
          className="w-full h-13.25 bg-black border border-[#333] py-2 px-1 text-white text-sm rounded outline-none focus:border-[#db9e15]"
        >
          <option value="">Tous les sites</option>
          {availableSites.map((site) => (
            <option key={site._id} value={site._id}>
              {site.zoneName}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setFilters({ ...filters, favorite: !filters.favorite })}
        className={`px-4 h-13.25 rounded text-[10px] font-black uppercase transition-all flex items-center gap-2 whitespace-nowrap ${
          filters.favorite ? 'bg-[#db9e15] border text-black' : 'bg-[#1a1a1a] text-gray-400 border border-[#333]'
        }`}
      >
        <span className="text-lg h-8">{filters.favorite ? '★' : '☆'}</span>
        Favoris
      </button>

      <button
        onClick={triggerUpdate}
        className="bg-[#db9e15] hover:bg-[#b88512] h-13.25 text-black font-black uppercase px-6 py-2 rounded transition-colors flex items-center gap-2"
      >
        <span className="text-xl h-8">⌕</span>
        RECHERCHER
      </button>
    </div>
  );
}

export default StrategyFilters;