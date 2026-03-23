import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SearchX, Building2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { apiRequest } from '../utils/apiClient';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{
        clients: any[];
        contrats: any[];
        compagnies: any[];
        paiements: any[]; // conservé pour compat (pas affiché dans l'UI)
    }>({
        clients: [],
        contrats: [],
        compagnies: [],
        paiements: [],
    });
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    // Fermer les résultats en cliquant ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target;
            if (searchRef.current && target instanceof Node && !searchRef.current.contains(target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recherche avec debounce
    useEffect(() => {
        if (query.length < 2) {
            setResults({ clients: [], contrats: [], compagnies: [], paiements: [] });
            return;
        }

        const timeoutId = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async (searchQuery: string) => {
        setLoading(true);
        try {
            const q = String(searchQuery || '').trim().toLowerCase();
            if (q.length < 2) {
                setResults({ clients: [], contrats: [], compagnies: [], paiements: [] });
                setShowResults(false);
                return;
            }

            const params = new URLSearchParams();
            params.set('q', q);
            params.set('limit', '5');

            const payload = (await apiRequest(`${API_ENDPOINTS.search.get}?${params.toString()}`)) as any;

            setResults({
                clients: Array.isArray(payload?.clients) ? payload.clients : [],
                contrats: Array.isArray(payload?.contrats) ? payload.contrats : [],
                compagnies: Array.isArray(payload?.compagnies) ? payload.compagnies : [],
                paiements: Array.isArray(payload?.paiements) ? payload.paiements : [],
            });

            setShowResults(true);
        } catch (error) {
            console.error('Erreur recherche:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClientClick = (client: any) => {
        navigate('/org/clients', { state: { selectedClientId: client.id } });
        setShowResults(false);
        setQuery('');
    };

    const handleContratClick = (contrat: any) => {
        navigate('/org/contrats', { state: { selectedContratId: contrat.id } });
        setShowResults(false);
        setQuery('');
    };

    const handleCompagnieClick = (compagnie: any) => {
        navigate('/org/compagnies', { state: { selectedCompagnieId: compagnie.id } });
        setShowResults(false);
        setQuery('');
    };

    const handlePaiementClick = (paiement: any) => {
        const contratId = paiement?.contrat_id || paiement?.contrats?.id;
        navigate('/org/paiements', { state: { selectedContractId: contratId } });
        setShowResults(false);
        setQuery('');
    };

    const getTotalResults = () => {
        return results.clients.length + results.contrats.length + results.compagnies.length + results.paiements.length;
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(Number(amount)) + ' FCFA';
    };

    return (
        <div ref={searchRef} className="relative flex-1 max-w-md">
            {/* Barre de recherche */}
            <div className="relative w-full">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#13151A] border border-slate-200 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-none transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-none text-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-[#0066FF]"></div>
                    </div>
                )}
            </div>

            {/* Résultats */}
            {showResults && query.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                    {getTotalResults() === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <SearchX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Aucun résultat pour "{query}"</p>
                        </div>
                    ) : (
                        <>
                            {/* Clients */}
                            {results.clients.length > 0 && (
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                                        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Clients ({results.clients.length})</h3>
                                    </div>
                                    {results.clients.map((client) => (
                                        <button
                                            key={client.id}
                                            onClick={() => handleClientClick(client)}
                                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                {client.nom?.[0]}{client.prenom?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {client.nom} {client.prenom}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                    {client.email || client.telephone}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${client.type_client === 'entreprise'
                                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                {client.type_client}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Contrats */}
                            {results.contrats.length > 0 && (
                                <div className="border-b border-gray-200 dark:border-gray-700">
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                                        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Contrats ({results.contrats.length})</h3>
                                    </div>
                                    {results.contrats.map((contrat) => (
                                        <button
                                            key={contrat.id}
                                            onClick={() => handleContratClick(contrat)}
                                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {contrat.clients?.nom} {contrat.clients?.prenom}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {contrat.compagnies?.nom} • {contrat.type_contrat.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                        {formatCurrency(contrat.commission)}
                                                    </p>
                                                    <span className={`px-2 py-0.5 rounded text-xs ${contrat.statut === 'actif'
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {contrat.statut}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Compagnies */}
                            {results.compagnies.length > 0 && (
                                <div>
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                                        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Compagnies ({results.compagnies.length})</h3>
                                    </div>
                                    {results.compagnies.map((compagnie) => (
                                        <button
                                            key={compagnie.id}
                                            onClick={() => handleCompagnieClick(compagnie)}
                                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">{compagnie.nom}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {compagnie.email || compagnie.telephone}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Paiements */}
                            {results.paiements.length > 0 && (
                                <div className="border-t border-gray-200 dark:border-gray-700">
                                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
                                        <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                            Paiements ({results.paiements.length})
                                        </h3>
                                    </div>

                                    {results.paiements.map((paiement) => (
                                        <button
                                            key={paiement.id}
                                            onClick={() => handlePaiementClick(paiement)}
                                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {paiement.contrats?.clients
                                                            ? `${paiement.contrats.clients.nom || ''} ${paiement.contrats.clients.prenom || ''}`.trim()
                                                            : 'Paiement'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {paiement.type_paiement} • {paiement.mode_paiement}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                        {formatCurrency(paiement.montant)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {paiement.date_paiement
                                                            ? new Date(paiement.date_paiement).toLocaleDateString('fr-FR')
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}