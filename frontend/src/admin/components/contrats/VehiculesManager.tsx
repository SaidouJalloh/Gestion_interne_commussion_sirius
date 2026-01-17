// import { useState } from 'react';

// export const VehiculesManager = ({ vehicules, onAdd, onUpdate, onDelete, disabled = false }) => {
//     const [editingId, setEditingId] = useState(null);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [formData, setFormData] = useState({
//         immatriculation: '',
//         marque: '',
//         modele: '',
//         annee: '',
//         valeur_venale: '',
//         puissance_fiscale: '',
//         usage: 'privé',
//         notes: ''
//     });

//     const resetForm = () => {
//         setFormData({
//             immatriculation: '',
//             marque: '',
//             modele: '',
//             annee: '',
//             valeur_venale: '',
//             puissance_fiscale: '',
//             usage: 'privé',
//             notes: ''
//         });
//         setEditingId(null);
//         setShowAddForm(false);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!formData.immatriculation) {
//             return;
//         }

//         if (editingId) {
//             await onUpdate(editingId, formData);
//         } else {
//             await onAdd(formData);
//         }

//         resetForm();
//     };

//     const handleEdit = (vehicule) => {
//         setFormData({
//             immatriculation: vehicule.immatriculation || '',
//             marque: vehicule.marque || '',
//             modele: vehicule.modele || '',
//             annee: vehicule.annee || '',
//             valeur_venale: vehicule.valeur_venale || '',
//             puissance_fiscale: vehicule.puissance_fiscale || '',
//             usage: vehicule.usage || 'privé',
//             notes: vehicule.notes || ''
//         });
//         setEditingId(vehicule.id);
//         setShowAddForm(true);
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm('Supprimer ce véhicule ?')) {
//             await onDelete(id);
//         }
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex items-center justify-between">
//                 <h3 className="text-lg font-semibold text-gray-900">🚗 Véhicules de la flotte</h3>
//                 <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
//                     {vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''}
//                 </span>
//             </div>

//             {/* Liste des véhicules */}
//             {vehicules.length > 0 && (
//                 <div className="space-y-2">
//                     {vehicules.map((vehicule) => (
//                         <div key={vehicule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:border-primary-300 transition-colors">
//                             <div className="flex-1">
//                                 <p className="font-semibold text-gray-900">{vehicule.immatriculation}</p>
//                                 <p className="text-sm text-gray-600">
//                                     {vehicule.marque} {vehicule.modele} {vehicule.annee && `(${vehicule.annee})`}
//                                 </p>
//                             </div>
//                             {!disabled && (
//                                 <div className="flex gap-2">
//                                     <button
//                                         type="button"
//                                         onClick={() => handleEdit(vehicule)}
//                                         className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
//                                         title="Modifier"
//                                     >
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                         </svg>
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={() => handleDelete(vehicule.id)}
//                                         className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
//                                         title="Supprimer"
//                                     >
//                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                         </svg>
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Bouton ajouter */}
//             {!showAddForm && !disabled && (
//                 <button
//                     type="button"
//                     onClick={() => setShowAddForm(true)}
//                     className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
//                 >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                     </svg>
//                     Ajouter un véhicule
//                 </button>
//             )}

//             {/* Formulaire ajout/édition */}
//             {showAddForm && (
//                 <form onSubmit={handleSubmit} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
//                     <h4 className="font-semibold text-gray-900">
//                         {editingId ? '✏️ Modifier le véhicule' : '➕ Nouveau véhicule'}
//                     </h4>

//                     <div className="grid md:grid-cols-2 gap-3">
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Immatriculation <span className="text-danger-500">*</span></label>
//                             <input
//                                 type="text"
//                                 value={formData.immatriculation}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, immatriculation: e.target.value }))}
//                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 placeholder="DK-1234-AA"
//                                 required
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Usage</label>
//                             <select
//                                 value={formData.usage}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, usage: e.target.value }))}
//                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                             >
//                                 <option value="privé">Privé</option>
//                                 <option value="commercial">Commercial</option>
//                                 <option value="transport">Transport</option>
//                                 <option value="taxi">Taxi</option>
//                                 <option value="location">Location</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-3">
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Marque</label>
//                             <input
//                                 type="text"
//                                 value={formData.marque}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, marque: e.target.value }))}
//                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 placeholder="Toyota"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Modèle</label>
//                             <input
//                                 type="text"
//                                 value={formData.modele}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, modele: e.target.value }))}
//                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 placeholder="Hilux"
//                             />
//                         </div>
//                     </div>

//                     <div className="grid md:grid-cols-3 gap-3">
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Année</label>
//                             <input
//                                 type="number"
//                                 value={formData.annee}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, annee: e.target.value }))}
//                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 placeholder="2023"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Valeur (FCFA)</label>
//                             <input
//                                 type="number"
//                                 value={formData.valeur_venale}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, valeur_venale: e.target.value }))}
//                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 placeholder="5000000"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Puissance (CV)</label>
//                             <input
//                                 type="number"
//                                 value={formData.puissance_fiscale}
//                                 onChange={(e) => setFormData(prev => ({ ...prev, puissance_fiscale: e.target.value }))}
//                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
//                                 placeholder="7"
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium mb-1">Notes</label>
//                         <textarea
//                             value={formData.notes}
//                             onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
//                             className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
//                             rows={2}
//                             placeholder="Informations complémentaires..."
//                         />
//                     </div>

//                     <div className="flex gap-2">
//                         <button
//                             type="button"
//                             onClick={resetForm}
//                             className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
//                         >
//                             Annuler
//                         </button>
//                         <button
//                             type="submit"
//                             className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
//                         >
//                             {editingId ? 'Modifier' : 'Ajouter'}
//                         </button>
//                     </div>
//                 </form>
//             )}
//         </div>
//     );
// };













import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';

type Vehicule = { id: string; immatriculation: string };

type VehiculesManagerProps = {
    vehicules: Vehicule[];
    onAdd: (vehicule: { immatriculation: string }) => Promise<unknown> | unknown;
    onUpdate: (id: string, vehicule: Record<string, unknown>) => Promise<unknown> | unknown;
    onDelete: (id: string) => Promise<unknown> | unknown;
    disabled?: boolean;
};

export const VehiculesManager = ({ vehicules, onAdd, onUpdate, onDelete, disabled = false }: VehiculesManagerProps) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [immatriculation, setImmatriculation] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!immatriculation.trim()) {
            return;
        }

        await onAdd({ immatriculation: immatriculation.trim() });
        setImmatriculation('');
        setShowAddForm(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Supprimer ce véhicule ?')) {
            await onDelete(id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">🚗 Véhicules de la flotte</h3>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {vehicules.length} véhicule{vehicules.length > 1 ? 's' : ''}
                </span>
            </div>

            {/* Liste des véhicules */}
            {vehicules.length > 0 && (
                <div className="space-y-2">
                    {vehicules.map((vehicule) => (
                        <div key={vehicule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:border-primary-300 transition-colors">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{vehicule.immatriculation}</p>
                            </div>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(vehicule.id)}
                                    className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg"
                                    title="Supprimer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Bouton ajouter */}
            {!showAddForm && !disabled && (
                <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter un véhicule
                </button>
            )}

            {/* Formulaire ajout simplifié */}
            {showAddForm && (
                <form onSubmit={handleSubmit} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-gray-900">➕ Nouveau véhicule</h4>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Immatriculation <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={immatriculation}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setImmatriculation(e.target.value)}
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="DK-1234-AA"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setShowAddForm(false);
                                setImmatriculation('');
                            }}
                            className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                        >
                            Ajouter
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};