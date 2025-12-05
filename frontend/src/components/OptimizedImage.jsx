// src/components/OptimizedImage.jsx
// ✅ Composant Image optimisé avec lazy loading et fallback
import { useState } from 'react';

export const OptimizedImage = ({
    src,
    alt,
    className = '',
    fallback = '/placeholder.svg',
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setImageSrc(fallback);
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Placeholder pendant le chargement */}
            {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded" />
            )}

            {/* Image réelle */}
            <img
                src={imageSrc}
                alt={alt}
                onLoad={handleLoad}
                onError={handleError}
                className={`
          ${className} 
          ${isLoading ? 'opacity-0' : 'opacity-100'} 
          transition-opacity duration-300
          object-cover
        `}
                loading="lazy"
                {...props}
            />
        </div>
    );
};

// UTILISATION:
// Au lieu de:
// <img src={compagnie.logo_url} alt={compagnie.nom} className="w-10 h-10 rounded" />

// Utilisez:
// <OptimizedImage
//   src={compagnie.logo_url}
//   alt={compagnie.nom}
//   className="w-10 h-10 rounded"
//   fallback="/default-logo.png"
// />

// AVANTAGES:
// ✅ Lazy loading automatique
// ✅ Placeholder pendant chargement
// ✅ Fallback si erreur
// ✅ Transition smooth
// ✅ Optimisé pour la performance