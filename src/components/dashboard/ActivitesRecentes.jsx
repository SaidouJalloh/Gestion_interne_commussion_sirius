// src/components/dashboard/ActivitesRecentes.jsx
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/dashboardHelpers';

export const ActivitesRecentes = ({ activites }) => {
    const navigate = useNavigate();

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Derniers contrats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Derniers contrats</h2>
                <div className="space-y-3">
                    {activites.derniers_contrats.map((contrat) => (
                        <div
                            key={contrat.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => navigate('/contrats')}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {contrat.clients?.nom} {contrat.clients?.prenom}
                                </p>
                                <span
                                    className={`px-2 py-0.5 rounded text-xs ${contrat.clients?.type_client === 'entreprise'
                                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                            : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                        }`}
                                >
                                    {contrat.clients?.type_client}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{contrat.compagnies?.nom}</p>
                            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1">
                                {formatCurrency(contrat.commission)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Derniers paiements */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Derniers paiements</h2>
                <div className="space-y-3">
                    {activites.derniers_paiements.map((paiement) => (
                        <div
                            key={paiement.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => navigate('/paiements')}
                        >
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {paiement.contrats?.clients?.nom} {paiement.contrats?.clients?.prenom}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {paiement.type_paiement === 'client_prime' ? 'Prime client' : 'Commission'}
                            </p>
                            <p className="text-xs text-success-600 dark:text-success-400 font-semibold mt-1">
                                {formatCurrency(paiement.montant)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contrats expirants */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contrats à renouveler</h2>
                <div className="space-y-3">
                    {activites.contrats_expirants.length > 0 ? (
                        activites.contrats_expirants.map((contrat) => (
                            <div
                                key={contrat.id}
                                className="p-3 bg-warning-50 dark:bg-warning-900 rounded-lg hover:bg-warning-100 dark:hover:bg-warning-800 transition-colors cursor-pointer"
                                onClick={() => navigate('/contrats')}
                            >
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {contrat.clients?.nom} {contrat.clients?.prenom}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{contrat.compagnies?.nom}</p>
                                <p className="text-xs text-warning-600 dark:text-warning-300 font-semibold mt-1">
                                    Expire le {new Date(contrat.date_expiration).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                            Aucun contrat à renouveler
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};