// src/components/compagnies/CompagnieCard.jsx
import { getInitials } from '../../utils/compagnieHelpers';

export const CompagnieCard = ({ compagnie, onEdit, onDelete, onEditTaux, canDelete }) => {
    return (
        <div className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {compagnie.logo_url ? (
                            <img
                                src={compagnie.logo_url}
                                alt={compagnie.nom}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg ${compagnie.logo_url ? 'hidden' : ''}`}
                        >
                            {getInitials(compagnie.sigle)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{compagnie.nom}</h3>
                            <p className="text-sm text-gray-500">{compagnie.sigle}</p>
                        </div>
                    </div>
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${compagnie.actif
                                ? 'bg-success-100 text-success-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        {compagnie.actif ? 'Actif' : 'Inactif'}
                    </span>
                </div>

                {compagnie.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {compagnie.description}
                    </p>
                )}

                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Types d'assurances</p>
                    <p className="text-2xl font-bold text-primary-600">
                        {Object.keys(compagnie.taux_commissions || {}).length}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEditTaux(compagnie)}
                        className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                    >
                        ⚙️ Gérer les taux
                    </button>
                    <button
                        onClick={() => onEdit(compagnie)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Modifier"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(compagnie.id)}
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Supprimer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};