import type { KeyboardEvent } from 'react';
import { useState } from 'react';

type VehiculeInput = {
    id?: string;
    tempId?: number;
    immatriculation: string;
};

type VehiculesInputProps = {
    vehicules: VehiculeInput[];
    onChange: (vehicules: VehiculeInput[]) => void;
    disabled?: boolean;
};

export const VehiculesInput = ({ vehicules, onChange, disabled = false }: VehiculesInputProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const immat = inputValue.trim();
        if (!immat) return;

        if (vehicules.some((v) => v.immatriculation === immat)) {
            alert('Cette immatriculation existe déjà !');
            return;
        }

        onChange([...vehicules, { immatriculation: immat, tempId: Date.now() }]);
        setInputValue('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleDelete = (idOrTempId: string | number) => {
        onChange(vehicules.filter((v) => (v.id || v.tempId) !== idOrTempId));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">🚗 Véhicules de la flotte</h3>
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''}
                </span>
            </div>

            {!disabled && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Ex: DK-1234-AA (Entrée pour ajouter)"
                    />
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium whitespace-nowrap"
                    >
                        + Ajouter
                    </button>
                </div>
            )}

            {vehicules.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {vehicules.map((vehicule, index) => (
                        <div
                            key={vehicule.id || vehicule.tempId || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:border-primary-300 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                    #{index + 1}
                                </span>
                                <span className="font-semibold text-gray-900">{vehicule.immatriculation}</span>
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const idOrTempId = vehicule.id ?? vehicule.tempId;
                                        if (idOrTempId === undefined) return;
                                        handleDelete(idOrTempId);
                                    }}
                                    className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
                                    title="Supprimer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};