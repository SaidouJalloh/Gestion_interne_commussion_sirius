import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortailAuth } from '../context/PortailAuthContext';
import { creerSinistre, uploadDocument } from '../services/portailService';
import PortailLayout from '../components/PortailLayout';
import {
    ArrowLeft,
    FileText,
    Calendar,
    MapPin,
    AlertCircle,
    Upload,
    X,
    CheckCircle,
    Car,
    Home as HomeIcon,
    Flame,
    Droplets,
    Wind,
    Heart,
    DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const NouveauSinistre = () => {
    const navigate = useNavigate();
    const { clientData } = usePortailAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type_sinistre: '',
        date_sinistre: '',
        heure_sinistre: '',
        lieu_sinistre: '',
        ville: '',
        description: '',
        montant_estime: ''
    });
    const [documents, setDocuments] = useState([]);
    const [errors, setErrors] = useState({});

    const typesSinistre = [
        { value: 'accident_automobile', label: 'Accident automobile', icon: Car, color: 'bg-red-50 text-red-600 border-red-200' },
        { value: 'vol', label: 'Vol', icon: AlertCircle, color: 'bg-orange-50 text-orange-600 border-orange-200' },
        { value: 'incendie', label: 'Incendie', icon: Flame, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
        { value: 'degat_des_eaux', label: 'Dégât des eaux', icon: Droplets, color: 'bg-blue-50 text-blue-600 border-blue-200' },
        { value: 'catastrophe_naturelle', label: 'Catastrophe naturelle', icon: Wind, color: 'bg-purple-50 text-purple-600 border-purple-200' },
        { value: 'dommage_corporel', label: 'Dommage corporel', icon: Heart, color: 'bg-pink-50 text-pink-600 border-pink-200' },
        { value: 'bris_de_glace', label: 'Bris de glace', icon: HomeIcon, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
        { value: 'autres', label: 'Autres', icon: FileText, color: 'bg-gray-50 text-gray-600 border-gray-200' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 10 * 1024 * 1024; // 10 MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                toast.error(`${file.name} est trop volumineux (max 10 MB)`);
                return false;
            }
            if (!allowedTypes.includes(file.type)) {
                toast.error(`${file.name} n'est pas un format accepté`);
                return false;
            }
            return true;
        });

        setDocuments(prev => [...prev, ...validFiles]);
    };

    const removeDocument = (index) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.type_sinistre) {
            newErrors.type_sinistre = 'Sélectionnez un type de sinistre';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};

        if (!formData.date_sinistre) {
            newErrors.date_sinistre = 'La date est requise';
        }
        if (!formData.lieu_sinistre) {
            newErrors.lieu_sinistre = 'Le lieu est requis';
        }
        if (!formData.ville) {
            newErrors.ville = 'La ville est requise';
        }
        if (!formData.description || formData.description.length < 20) {
            newErrors.description = 'Description trop courte (min 20 caractères)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setLoading(true);

        try {
            // 1. Créer le sinistre
            const sinistrePayload = {
                client_id: clientData.client.id,
                compagnie_id: null,
                gestionnaire_id: null,
                type_sinistre: formData.type_sinistre,
                date_sinistre: formData.date_sinistre,
                heure_sinistre: formData.heure_sinistre || null,
                lieu_sinistre: formData.lieu_sinistre,
                ville: formData.ville,
                description: formData.description,
                montant_estime: formData.montant_estime ? parseFloat(formData.montant_estime) : null,
                statut: 'recu',
                date_reception: new Date().toISOString()
            };

            const { data: sinistre, error: sinistreError } = await creerSinistre(sinistrePayload);

            if (sinistreError || !sinistre) {
                throw new Error('Erreur création sinistre');
            }

            // 2. Uploader les documents
            if (documents.length > 0) {
                const uploadPromises = documents.map(file =>
                    uploadDocument(clientData.client.id, sinistre.id, file, 'piece_jointe')
                );

                const results = await Promise.all(uploadPromises);
                const errors = results.filter(r => r.error);

                if (errors.length > 0) {
                    toast.error(`${errors.length} document(s) n'ont pas pu être uploadés`);
                }
            }

            // 3. Succès
            toast.success('Sinistre déclaré avec succès !', { duration: 4000 });
            setTimeout(() => {
                navigate('/portail/mes-sinistres');
            }, 1500);

        } catch (error) {
            console.error('Erreur soumission:', error);
            toast.error('Erreur lors de la déclaration');
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <PortailLayout>
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => navigate('/portail/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm sm:text-base">Retour au tableau de bord</span>
                    </button>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        Déclarer un sinistre
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Remplissez le formulaire pour déclarer votre sinistre
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        {/* Ligne de progression */}
                        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${((step - 1) / 2) * 100}%` }}
                            ></div>
                        </div>

                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {step > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
                            </div>
                            <span className="text-xs sm:text-sm mt-2 text-gray-600 hidden sm:block">Type</span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                {step > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
                            </div>
                            <span className="text-xs sm:text-sm mt-2 text-gray-600 hidden sm:block">Détails</span>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                3
                            </div>
                            <span className="text-xs sm:text-sm mt-2 text-gray-600 hidden sm:block">Documents</span>
                        </div>
                    </div>
                </div>

                {/* Contenu du formulaire */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">

                    {/* STEP 1 : Type de sinistre */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                    Quel type de sinistre souhaitez-vous déclarer ?
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600">
                                    Sélectionnez le type qui correspond le mieux à votre situation
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {typesSinistre.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.value}
                                            onClick={() => setFormData(prev => ({ ...prev, type_sinistre: type.value }))}
                                            className={`p-4 sm:p-5 rounded-xl border-2 transition-all text-left hover:shadow-md active:scale-98 ${formData.type_sinistre === type.value
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center border-2 ${type.color}`}>
                                                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                                        {type.label}
                                                    </h3>
                                                </div>
                                                {formData.type_sinistre === type.value && (
                                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.type_sinistre && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{errors.type_sinistre}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2 : Détails */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                    Détails du sinistre
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600">
                                    Donnez-nous plus d'informations sur ce qui s'est passé
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date du sinistre *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="date"
                                            name="date_sinistre"
                                            value={formData.date_sinistre}
                                            onChange={handleChange}
                                            max={new Date().toISOString().split('T')[0]}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.date_sinistre ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    {errors.date_sinistre && (
                                        <p className="text-red-600 text-sm mt-1">{errors.date_sinistre}</p>
                                    )}
                                </div>

                                {/* Heure */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Heure (optionnel)
                                    </label>
                                    <input
                                        type="time"
                                        name="heure_sinistre"
                                        value={formData.heure_sinistre}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Lieu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lieu du sinistre *
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="lieu_sinistre"
                                        value={formData.lieu_sinistre}
                                        onChange={handleChange}
                                        placeholder="Ex: Avenue Bourguiba, en face de la pharmacie"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.lieu_sinistre ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                </div>
                                {errors.lieu_sinistre && (
                                    <p className="text-red-600 text-sm mt-1">{errors.lieu_sinistre}</p>
                                )}
                            </div>

                            {/* Ville */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ville *
                                </label>
                                <input
                                    type="text"
                                    name="ville"
                                    value={formData.ville}
                                    onChange={handleChange}
                                    placeholder="Ex: Dakar"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.ville ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.ville && (
                                    <p className="text-red-600 text-sm mt-1">{errors.ville}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description détaillée *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Décrivez ce qui s'est passé en détail : circonstances, dommages constatés, personnes impliquées..."
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    {errors.description ? (
                                        <p className="text-red-600 text-sm">{errors.description}</p>
                                    ) : (
                                        <p className="text-gray-500 text-sm">
                                            {formData.description.length} caractères (min 20)
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Montant estimé */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Montant estimé des dommages (optionnel)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        name="montant_estime"
                                        value={formData.montant_estime}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        step="1000"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <p className="text-gray-500 text-sm mt-1">
                                    Estimation approximative en FCFA
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 : Documents */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                                    Documents justificatifs
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600">
                                    Ajoutez des photos, documents ou tout élément utile
                                </p>
                            </div>

                            {/* Zone d'upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center gap-4"
                                >
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                                            Cliquez pour ajouter des fichiers
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            JPG, PNG ou PDF (max 10 MB chacun)
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Liste des fichiers */}
                            {documents.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-medium text-gray-900">
                                        Fichiers ajoutés ({documents.length})
                                    </h3>
                                    {documents.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeDocument(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-900">
                                        <p className="font-medium mb-1">Documents utiles :</p>
                                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                                            <li>Photos des dommages</li>
                                            <li>Constat amiable (si accident)</li>
                                            <li>Factures, devis de réparation</li>
                                            <li>Certificats médicaux (si blessés)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Boutons de navigation */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                            >
                                Précédent
                            </button>
                        )}

                        {step < 3 ? (
                            <button
                                onClick={handleNextStep}
                                className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Suivant
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 sm:flex-none px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Envoi en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Soumettre la déclaration</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </PortailLayout>
    );
};

export default NouveauSinistre;