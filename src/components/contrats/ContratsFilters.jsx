// src/components/contrats/ContratsFilters.jsx

export const ContratsFilters = ({ searchTerm, setSearchTerm, filterStatut, setFilterStatut }) => {
    return (
        <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Rechercher un contrat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                </div>
                <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actifs</option>
                    <option value="expiré">Expirés</option>
                    <option value="annulé">Annulés</option>
                </select>
            </div>
        </div>
    );
};