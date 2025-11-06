import { useEffect, useState, useCallback } from 'react'; // ✅ useCallback ajouté
import { Link } from 'react-router-dom';
import { usePortailAuth } from '../context/PortailAuthContext';
import { supabase } from '../../lib/supabaseClient';
import PortailLayout from '../components/PortailLayout';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    AlertCircle,
    ArrowRight,
    TrendingUp,
    Calendar
} from 'lucide-react';

const PortailDashboard = () => {
    const { clientData } = usePortailAuth();
    const [stats, setStats] = useState({
        total: 0,
        en_cours: 0,
        valides: 0,
        rejetes: 0
    });
    const [recentSinistres, setRecentSinistres] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Utiliser useCallback pour éviter le warning
    const loadDashboardData = useCallback(async () => {
        if (!clientData?.client?.id) return;

        try {
            setLoading(true);

            // Charger les statistiques
            const { data: sinistres, error: sinistresError } = await supabase
                .from('sinistres')
                .select('id, statut')
                .eq('client_id', clientData.client.id);

            if (sinistresError) throw sinistresError;

            // Calculer les stats
            const statsData = {
                total: sinistres?.length || 0,
                en_cours: sinistres?.filter(s => ['recu', 'en_cours', 'expertise_en_cours'].includes(s.statut)).length || 0,
                valides: sinistres?.filter(s => s.statut === 'valide').length || 0,
                rejetes: sinistres?.filter(s => s.statut === 'rejete').length || 0
            };

            setStats(statsData);

            // Charger les 5 derniers sinistres
            const { data: recents, error: recentsError } = await supabase
                .from('sinistres')
                .select('*')
                .eq('client_id', clientData.client.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentsError) throw recentsError;

            setRecentSinistres(recents || []);

        } catch (error) {
            console.error('Erreur chargement dashboard:', error);
        } finally {
            setLoading(false);
        }
    }, [clientData]); // ✅ clientData comme dépendance

    // ✅ useEffect avec loadDashboardData dans les dépendances
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);


    const getStatutBadge = (statut) => {
        const badges = {
            recu: { label: 'Bien reçu', color: 'bg-blue-100 text-blue-800' },
            en_cours: { label: 'En cours', color: 'bg-yellow-100 text-yellow-800' },
            attente_documents: { label: 'Documents manquants', color: 'bg-orange-100 text-orange-800' },
            expertise_en_cours: { label: 'Expertise', color: 'bg-purple-100 text-purple-800' },
            valide: { label: 'Validé', color: 'bg-green-100 text-green-800' },
            rejete: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
            cloture: { label: 'Clôturé', color: 'bg-gray-100 text-gray-800' }
        };
        return badges[statut] || { label: statut, color: 'bg-gray-100 text-gray-800' };
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <PortailLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                </div>
            </PortailLayout>
        );
    }

    return (
        <PortailLayout>
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">

                {/* En-tête - Responsive */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                            Bonjour, {clientData?.client?.prenom} 👋
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                            Bienvenue sur votre espace personnel
                        </p>
                    </div>

                    {/* Bouton Déclarer - Responsive */}
                    <Link
                        to="/portail/nouveau-sinistre"
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm sm:text-base"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Déclarer un sinistre</span>
                    </Link>
                </div>

                {/* Statistiques - Grid responsive */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">

                    {/* Carte Total */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total</p>
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Depuis inscription</span>
                                <span className="sm:hidden">Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Carte En cours */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">En cours</p>
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-yellow-600">{stats.en_cours}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">En traitement</span>
                                <span className="sm:hidden">Actifs</span>
                            </div>
                        </div>
                    </div>

                    {/* Carte Validés */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Validés</p>
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">{stats.valides}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Avec succès</span>
                                <span className="sm:hidden">Acceptés</span>
                            </div>
                        </div>
                    </div>

                    {/* Carte Rejetés */}
                    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Rejetés</p>
                                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600">{stats.rejetes}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-600">
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Non acceptés</span>
                                <span className="sm:hidden">Refusés</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sinistres récents - Responsive */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
                    <div className="p-4 sm:p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                Sinistres récents
                            </h2>
                            <Link
                                to="/portail/mes-sinistres"
                                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 flex-shrink-0"
                            >
                                <span className="hidden sm:inline">Voir tout</span>
                                <span className="sm:hidden">Tout</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {recentSinistres.length === 0 ? (
                            <div className="p-6 sm:p-12 text-center">
                                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                                    Aucun sinistre
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                                    Vous n'avez pas encore déclaré de sinistre
                                </p>
                                <Link
                                    to="/portail/nouveau-sinistre"
                                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-98 transition-all text-sm sm:text-base font-medium"
                                >
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="hidden sm:inline">Déclarer mon premier sinistre</span>
                                    <span className="sm:hidden">Déclarer</span>
                                </Link>
                            </div>
                        ) : (
                            recentSinistres.map((sinistre) => {
                                const badge = getStatutBadge(sinistre.statut);
                                return (
                                    <Link
                                        key={sinistre.id}
                                        to={`/portail/sinistre/${sinistre.id}`}
                                        className="p-4 sm:p-6 hover:bg-gray-50 active:bg-gray-100 transition-colors block"
                                    >
                                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                        {sinistre.numero_sinistre}
                                                    </h3>
                                                    <span className={`text-xs px-2 sm:px-2.5 py-1 rounded-full font-medium ${badge.color} inline-block w-fit`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-gray-600 mb-1 capitalize">
                                                    {sinistre.type_sinistre.replace(/_/g, ' ')}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span>{formatDate(sinistre.date_reception)}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Aide - Responsive */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-100">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                                Besoin d'aide ?
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                                Notre équipe est là pour vous accompagner dans vos démarches.
                            </p>
                            <a
                                href="mailto:support@sirius-assurance.com"
                                className="inline-flex items-center gap-2 text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium active:scale-98 transition-transform"
                            >
                                Contactez-nous
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PortailLayout>
    );
};

export default PortailDashboard;