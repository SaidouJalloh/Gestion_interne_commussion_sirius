// src/pages/Souscription.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Souscription() {
    const [compagnies, setCompagnies] = useState([]);
    const [selectedCompagnie, setSelectedCompagnie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompagnies();
    }, []);

    const fetchCompagnies = async () => {
        try {
            const { data, error } = await supabase
                .from('compagnies')
                .select('*')
                .eq('actif', true)
                .not('lien_souscription', 'is', null)
                .order('nom');

            if (error) throw error;

            setCompagnies(data || []);

            // Sélectionner automatiquement la première compagnie
            if (data && data.length > 0) {
                setSelectedCompagnie(data[0]);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des compagnies:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (compagnies.length === 0) {
        return (
            <div className="p-6">
                <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune compagnie disponible</h3>
                    <p className="text-gray-600">Aucune compagnie avec un lien de souscription n'est configurée pour le moment.</p>
                    <p className="text-sm text-gray-500 mt-2">Ajoutez des liens de souscription dans la gestion des compagnies.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header avec titre */}
            <div className="bg-white border-b px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">🌐 Portail de Souscription</h1>
                        <p className="text-sm text-gray-600 mt-1">Accédez aux portails de souscription des compagnies</p>
                    </div>
                    {selectedCompagnie && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-primary-50 rounded-lg">
                            {selectedCompagnie.logo_url && (
                                <img
                                    src={selectedCompagnie.logo_url}
                                    alt={selectedCompagnie.nom}
                                    className="w-8 h-8 rounded object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <div>
                                <p className="text-xs text-gray-600">Compagnie active</p>
                                <p className="font-semibold text-primary-700">{selectedCompagnie.nom}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sélecteur de compagnies - Barre horizontale scrollable */}
            <div className="bg-white border-b shadow-sm overflow-x-auto">
                <div className="flex gap-2 p-4 min-w-max">
                    {compagnies.map((compagnie) => (
                        <button
                            key={compagnie.id}
                            onClick={() => setSelectedCompagnie(compagnie)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${selectedCompagnie?.id === compagnie.id
                                    ? 'border-primary-500 bg-primary-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-primary-300'
                                }`}
                        >
                            {compagnie.logo_url && (
                                <img
                                    src={compagnie.logo_url}
                                    alt={compagnie.nom}
                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            <div className="text-left">
                                <p className={`font-semibold text-sm ${selectedCompagnie?.id === compagnie.id ? 'text-primary-700' : 'text-gray-900'
                                    }`}>
                                    {compagnie.nom}
                                </p>
                                <p className="text-xs text-gray-500">{compagnie.sigle}</p>
                            </div>
                            {selectedCompagnie?.id === compagnie.id && (
                                <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Zone iframe - Portail de souscription */}
            <div className="flex-1 p-4">
                {selectedCompagnie && selectedCompagnie.lien_souscription ? (
                    <div className="h-full bg-white rounded-xl shadow-soft overflow-hidden">
                        <iframe
                            src={selectedCompagnie.lien_souscription}
                            className="w-full h-full border-0"
                            title={`Portail de souscription - ${selectedCompagnie.nom}`}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-soft">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <p className="text-gray-600 font-medium">Aucun lien configuré pour cette compagnie</p>
                            <p className="text-sm text-gray-500 mt-1">Ajoutez un lien de souscription dans la gestion des compagnies</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}