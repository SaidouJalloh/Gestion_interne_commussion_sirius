// src/components/compagnies/LogoUpload.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { validateImageFile } from '../../utils/compagnieHelpers';

export const LogoUpload = ({ currentLogo, onLogoChange }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState(currentLogo || '');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setPreview(currentLogo || '');
    }, [currentLogo]);

    const uploadFile = async (file) => {
        const validation = validateImageFile(file);

        if (!validation.isValid) {
            setError(validation.errors[0]);
            return;
        }

        try {
            setUploading(true);
            setError('');

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('compagnies-logos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('compagnies-logos')
                .getPublicUrl(fileName);

            setPreview(data.publicUrl);
            onLogoChange(data.publicUrl);
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            uploadFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
            uploadFile(file);
        }
    };

    const handleRemove = () => {
        setPreview('');
        onLogoChange('');
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Logo de la compagnie</label>
            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Logo"
                        className="w-full h-40 object-contain bg-gray-50 rounded-lg border-2 border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                        <label className="cursor-pointer px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            Changer
                        </label>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors"
                        >
                            Supprimer
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploading}
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                                    <p className="text-sm text-gray-600">Upload en cours...</p>
                                </>
                            ) : (
                                <>
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Glissez-déposez une image ici</p>
                                        <p className="text-xs text-gray-500 mt-1">ou cliquez pour parcourir</p>
                                    </div>
                                    <p className="text-xs text-gray-400">PNG, JPG, SVG jusqu'à 5MB</p>
                                </>
                            )}
                        </div>
                    </label>
                </div>
            )}
            {error && (
                <p className="text-sm text-danger-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};