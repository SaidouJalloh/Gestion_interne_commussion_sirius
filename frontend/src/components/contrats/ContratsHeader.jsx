// src/components/contrats/ContratsHeader.jsx

export const ContratsHeader = ({ count, onAdd }) => {
    return (
        <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Contrats</h1>
                    <p className="text-gray-600 mt-1">{count} contrat{count > 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-soft"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouveau contrat
                </button>
            </div>
        </div>
    );
};