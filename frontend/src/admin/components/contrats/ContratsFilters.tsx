// src/components/contrats/ContratsFilters.tsx

import type { Dispatch, RefObject, SetStateAction } from 'react';
import { Search, Filter } from 'lucide-react';

type ContratsFiltersProps = {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    filterStatut: string;
    setFilterStatut: Dispatch<SetStateAction<string>>;
    searchRef?: RefObject<HTMLInputElement | null>;
};

export const ContratsFilters = ({
    searchTerm,
    setSearchTerm,
    filterStatut,
    setFilterStatut,
    searchRef,
}: ContratsFiltersProps) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Rechercher un contrat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white shadow-sm font-medium text-slate-700"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="relative">
                <select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    className="appearance-none pl-10 pr-10 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white shadow-sm text-slate-700 font-medium whitespace-nowrap cursor-pointer"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="actif">Actifs</option>
                    <option value="expiré">Expirés</option>
                    <option value="annulé">Annulés</option>
                </select>
                <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>
    );
};