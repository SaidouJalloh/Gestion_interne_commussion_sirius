// src/components/contrats/DeleteConfirmModal.jsx

export const DeleteConfirmModal = ({ contratId, onConfirm, onCancel }) => {
    if (!contratId) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-strong max-w-md w-full animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Confirmer la suppression</h3>
                            <p className="text-sm text-gray-600 mt-1">Cette action est irréversible</p>
                        </div>
                    </div>
                    <p className="text-gray-700 mb-6">
                        Êtes-vous sûr de vouloir supprimer ce contrat ? Tous les paiements associés seront également supprimés.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium transition-colors">
                            Annuler
                        </button>
                        <button onClick={() => onConfirm(contratId)} className="flex-1 px-4 py-2.5 bg-danger-600 text-white rounded-lg hover:bg-danger-700 font-medium transition-colors">
                            Supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};