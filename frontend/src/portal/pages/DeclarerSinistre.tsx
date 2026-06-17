import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  ShieldAlert,
  Droplets,
  Flame,
  Stethoscope,
  Plane,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';
import { useClientContrats } from '../hooks/useClientContrats';
import {
  Card,
  Button,
  InputField,
  SelectField,
  TextAreaField,
  FileUploadZone,
  StepIndicator,
} from '../components/ui';

const STEPS = ['Type de sinistre', 'Informations', 'Détails', 'Confirmation'];

const SINISTRE_TYPES = [
  { value: 'accident_auto', label: 'Accident Auto', icon: Car, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  { value: 'vol', label: 'Vol', icon: ShieldAlert, color: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
  { value: 'degat_des_eaux', label: 'Dégât des Eaux', icon: Droplets, color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' },
  { value: 'incendie', label: 'Incendie', icon: Flame, color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  { value: 'sante', label: 'Santé', icon: Stethoscope, color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' },
  { value: 'voyage', label: 'Voyage', icon: Plane, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
];

interface FormData {
  type_sinistre: string;
  contrat_id: string;
  date_sinistre: string;
  heure_sinistre: string;
  lieu_sinistre: string;
  description: string;
  circonstances: string;
  dommages: string;
  files: File[];
}

const initialFormData: FormData = {
  type_sinistre: '',
  contrat_id: '',
  date_sinistre: '',
  heure_sinistre: '',
  lieu_sinistre: '',
  description: '',
  circonstances: '',
  dommages: '',
  files: [],
};

const DeclarerSinistre: React.FC = () => {
  const navigate = useNavigate();
  const { contrats } = useClientContrats();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.type_sinistre;
      case 2:
        return !!formData.contrat_id && !!formData.date_sinistre && !!formData.lieu_sinistre;
      case 3:
        return !!formData.description;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canGoNext()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const headers = await getApiHeaders(false);

      // Build multipart if files, otherwise JSON
      let response: Response;
      if (formData.files.length > 0) {
        const fd = new FormData();
        fd.append('type_sinistre', formData.type_sinistre);
        fd.append('contrat_id', formData.contrat_id);
        fd.append('date_sinistre', formData.date_sinistre);
        if (formData.heure_sinistre) fd.append('heure_sinistre', formData.heure_sinistre);
        fd.append('lieu_sinistre', formData.lieu_sinistre);
        fd.append('description', formData.description);
        if (formData.circonstances) fd.append('circonstances', formData.circonstances);
        if (formData.dommages) fd.append('dommages', formData.dommages);
        formData.files.forEach((file) => fd.append('documents', file));

        // Remove Content-Type so browser sets multipart boundary
        const multipartHeaders = { ...headers };
        delete multipartHeaders['Content-Type'];

        response = await fetch(API_ENDPOINTS.clientPortal.createSinistre, {
          method: 'POST',
          headers: multipartHeaders,
          body: fd,
        });
      } else {
        response = await fetch(API_ENDPOINTS.clientPortal.createSinistre, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type_sinistre: formData.type_sinistre,
            contrat_id: formData.contrat_id,
            date_sinistre: formData.date_sinistre,
            heure_sinistre: formData.heure_sinistre || undefined,
            lieu_sinistre: formData.lieu_sinistre,
            description: formData.description,
            circonstances: formData.circonstances || undefined,
            dommages: formData.dommages || undefined,
          }),
        });
      }

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || 'Erreur lors de la soumission.');
      }
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = SINISTRE_TYPES.find((t) => t.value === formData.type_sinistre);
  const selectedContrat = contrats.find((c: any) => String(c.id) === formData.contrat_id);

  const contratOptions = contrats.map((c: any) => ({
    value: String(c.id),
    label: `${c.type_contrat || c.type || 'Contrat'} - ${c.numero_contrat || c.numero || c.id}`,
  }));

  // Success screen
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-full mb-6">
          <CheckCircle2 className="w-16 h-16 text-success-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Déclaration envoyée !
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          Votre déclaration de sinistre a été soumise avec succès. Vous pouvez suivre son avancement dans la liste de vos sinistres.
        </p>
        <Button onClick={() => navigate('/client/sinistres')} icon={ArrowRight} iconPosition="right">
          Voir mes sinistres
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/client/sinistres')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux sinistres
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Déclarer un sinistre</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Remplissez le formulaire ci-dessous pour déclarer un nouveau sinistre.
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Type */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quel type de sinistre souhaitez-vous déclarer ?
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Sélectionnez le type correspondant à votre situation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {SINISTRE_TYPES.map((type) => {
                const isSelected = formData.type_sinistre === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('type_sinistre', type.value)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${type.color}`}>
                      <type.icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? 'text-primary-700 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Informations */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Informations générales
            </h2>
            <SelectField
              label="Contrat concerné"
              required
              options={contratOptions}
              value={formData.contrat_id}
              onChange={(e) => updateField('contrat_id', e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Date du sinistre"
                type="date"
                required
                icon={Calendar}
                value={formData.date_sinistre}
                onChange={(e) => updateField('date_sinistre', e.target.value)}
              />
              <InputField
                label="Heure du sinistre"
                type="time"
                value={formData.heure_sinistre}
                onChange={(e) => updateField('heure_sinistre', e.target.value)}
              />
            </div>
            <InputField
              label="Lieu du sinistre"
              required
              icon={MapPin}
              placeholder="Adresse ou lieu du sinistre"
              value={formData.lieu_sinistre}
              onChange={(e) => updateField('lieu_sinistre', e.target.value)}
            />
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Détails du sinistre
            </h2>
            <TextAreaField
              label="Description"
              required
              placeholder="Décrivez brièvement ce qui s'est passé..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
            <TextAreaField
              label="Circonstances"
              placeholder="Détaillez les circonstances du sinistre..."
              helper="Indiquez les conditions, les témoins éventuels, etc."
              value={formData.circonstances}
              onChange={(e) => updateField('circonstances', e.target.value)}
            />
            <TextAreaField
              label="Dommages constates"
              placeholder="Listez les dommages matériels et/ou corporels..."
              value={formData.dommages}
              onChange={(e) => updateField('dommages', e.target.value)}
            />
            <FileUploadZone
              label="Documents justificatifs"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              multiple
              helper="Photos, constats, factures, etc."
              onFilesChange={(files) => updateField('files', files)}
            />
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Récapitulatif
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Vérifiez les informations avant de soumettre votre déclaration.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type de sinistre</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedType?.label || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Contrat</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedContrat
                      ? `${selectedContrat.type_contrat || selectedContrat.type || 'Contrat'} - ${selectedContrat.numero_contrat || selectedContrat.numero || selectedContrat.id}`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.date_sinistre || 'N/A'}
                    {formData.heure_sinistre ? ` à ${formData.heure_sinistre}` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Lieu</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.lieu_sinistre || 'N/A'}
                  </span>
                </div>
              </div>

              {formData.description && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formData.description}</p>
                </div>
              )}

              {formData.circonstances && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Circonstances</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formData.circonstances}</p>
                </div>
              )}

              {formData.dommages && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dommages</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formData.dommages}</p>
                </div>
              )}

              {formData.files.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Documents ({formData.files.length})
                  </p>
                  <div className="space-y-1">
                    {formData.files.map((file, i) => (
                      <p key={i} className="text-sm text-gray-900 dark:text-white">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl">
                <p className="text-sm text-danger-700 dark:text-danger-400">{error}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1}
          icon={ArrowLeft}
        >
          Précédent
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canGoNext()}
            icon={ArrowRight}
            iconPosition="right"
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={submitting}
            icon={CheckCircle2}
          >
            Soumettre la declaration
          </Button>
        )}
      </div>
    </div>
  );
};

export default DeclarerSinistre;
