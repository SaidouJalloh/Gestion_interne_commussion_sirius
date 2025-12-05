import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        clients: [],
        contrats: [],
        compagnies: [],
        paiements: []
    });
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Fermer les résultats en cliquant ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
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

    const performSearch = async (searchQuery) => {
        setLoading(true);
        try {
            const searchTerm = `%${searchQuery}%`;

            // Recherche parallèle dans toutes les tables
            const [clientsRes, contratsRes, compagniesRes, paiementsRes] = await Promise.all([
                // Clients
                supabase
                    .from('clients')
                    .select('*')
                    .or(`nom.ilike.${searchTerm},prenom.ilike.${searchTerm},email.ilike.${searchTerm},telephone.ilike.${searchTerm}`)
                    .limit(5),

                // Contrats
                supabase
                    .from('contrats')
                    .select('*, clients(nom, prenom), compagnies(nom)')
                    .or(`numero_police.ilike.${searchTerm}`)
                    .limit(5),

                // Compagnies
                supabase
                    .from('compagnies')
                    .select('*')
                    .ilike('nom', searchTerm)
                    .limit(5),

                // Paiements
                supabase
                    .from('paiements')
                    .select('*, contrats(clients(nom, prenom))')
                    .limit(5)
            ]);

            setResults({
                clients: clientsRes.data || [],
                contrats: contratsRes.data || [],
                compagnies: compagniesRes.data || [],
                paiements: paiementsRes.data || []
            });

            setShowResults(true);
        } catch (error) {
            console.error('Erreur recherche:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClientClick = (client) => {
        navigate('/clients', { state: { selectedClientId: client.id } });
        setShowResults(false);
        setQuery('');
    };

    const handleContratClick = (contrat) => {
        navigate('/contrats', { state: { selectedContratId: contrat.id } });
        setShowResults(false);
        setQuery('');
    };

    const handleCompagnieClick = (compagnie) => {
        navigate('/compagnies', { state: { selectedCompagnieId: compagnie.id } });
        setShowResults(false);
        setQuery('');
    };

    const getTotalResults = () => {
        return results.clients.length + results.contrats.length + results.compagnies.length + results.paiements.length;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(amount) + ' FCFA';
    };

    return (
        <div ref={searchRef} className="relative flex-1 max-w-md">
            {/* Barre de recherche */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher clients, contrats, compagnies..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    </div>
                )}
            </div>

            {/* Résultats */}
            {showResults && query.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                    {getTotalResults() === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
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
                                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
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
                        </>
                    )}
                </div>
            )}
        </div>
    );
}