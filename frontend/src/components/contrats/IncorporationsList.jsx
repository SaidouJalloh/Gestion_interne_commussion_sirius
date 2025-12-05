import { useIncorporations } from '../../hooks/useIncorporations';

export const IncorporationsList = ({ contratId }) => {
    const { incorporations, loading } = useIncorporations(contratId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (incorporations.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-gray-500">Aucune incorporation</p>
            </div>
        );
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="space-y-3">
            {incorporations.map((incorp) => (
                <div key={incorp.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                    +{incorp.nombre_elements} {incorp.nombre_elements > 1 ? 'éléments' : 'élément'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    📅 {new Date(incorp.date_effet).toLocaleDateString('fr-FR')} → {new Date(incorp.date_expiration).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            {incorp.notes && (
                                <p className="text-sm text-gray-600">{incorp.notes}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                                {formatCurrency(incorp.prime_ttc)} FCFA
                            </div>
                            <div className="text-xs text-gray-500">
                                Commission: {formatCurrency(incorp.commission)} FCFA
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-3 text-xs text-gray-600 border-t pt-2">
                        <div>
                            <span className="font-medium">TTC:</span> {formatCurrency(incorp.prime_ttc)}
                        </div>
                        {incorp.fga > 0 && (
                            <div>
                                <span className="font-medium">FGA:</span> {formatCurrency(incorp.fga)}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Taxes:</span> {formatCurrency(incorp.taxes)}
                        </div>
                        {incorp.montant_accessoire > 0 && (
                            <div>
                                <span className="font-medium">Acc:</span> {formatCurrency(incorp.montant_accessoire)}
                            </div>
                        )}
                        <div>
                            <span className="font-medium">Nette:</span> {formatCurrency(incorp.prime_nette)}
                        </div>
                    </div>

                    {incorp.created_by_profile && (
                        <div className="text-xs text-gray-400 mt-2">
                            Par {incorp.created_by_profile.prenom} {incorp.created_by_profile.nom}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};