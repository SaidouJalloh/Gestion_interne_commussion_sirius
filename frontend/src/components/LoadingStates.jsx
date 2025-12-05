// src/components/LoadingStates.jsx
// ✅ Composants pour des états de chargement élégants

// Skeleton pour les cartes
export const CardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-soft p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
    </div>
);

// Skeleton pour les lignes de table
export const TableRowSkeleton = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
        </td>
    </tr>
);

// Spinner simple
export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        xs: 'h-3 w-3 border-2',
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4',
    };

    return (
        <div className={`${sizes[size]} border-primary-200 border-t-primary-600 rounded-full animate-spin ${className}`}></div>
    );
};

// Spinner avec texte
export const SpinnerWithText = ({ text = 'Chargement...', size = 'md' }) => (
    <div className="flex flex-col items-center justify-center py-12">
        <Spinner size={size} className="mb-4" />
        <p className="text-gray-600 font-medium animate-pulse">{text}</p>
    </div>
);

// Loading overlay (pour modals)
export const LoadingOverlay = ({ show, text = 'Chargement...' }) => {
    if (!show) return null;

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="text-center">
                <Spinner size="lg" className="mb-4 mx-auto" />
                <p className="text-gray-700 font-medium">{text}</p>
            </div>
        </div>
    );
};

// Skeleton pour une liste complète
export const ListSkeleton = ({ count = 5 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
        ))}
    </div>
);

// Progress bar
export const ProgressBar = ({ progress, className = '' }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 overflow-hidden ${className}`}>
        <div
            className="bg-primary-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
        />
    </div>
);

// EXEMPLES D'UTILISATION:

// 1. Cartes en chargement
// {loading ? (
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//     <CardSkeleton />
//     <CardSkeleton />
//     <CardSkeleton />
//   </div>
// ) : (
//   // Vos vraies cartes
// )}

// 2. Table en chargement
// {loading ? (
//   <tbody>
//     <TableRowSkeleton />
//     <TableRowSkeleton />
//     <TableRowSkeleton />
//   </tbody>
// ) : (
//   // Vos vraies lignes
// )}

// 3. Spinner simple
// {loading && <Spinner />}

// 4. Overlay de chargement
// <div className="relative">
//   <LoadingOverlay show={saving} text="Enregistrement..." />
//   {/* Votre contenu */}
// </div>