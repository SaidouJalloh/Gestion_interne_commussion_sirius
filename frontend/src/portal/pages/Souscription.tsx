import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Home, Heart, Plane, Shield, Building2, Truck, Briefcase,
  ArrowRight, ArrowLeft, CheckCircle2, Info, Send, Loader2,
} from 'lucide-react';
import { Card, Button, StepIndicator, InputField, SelectField, TextAreaField } from '../components/ui';
import { useClientPortal } from '../../context/ClientPortalContext';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';
import toast from 'react-hot-toast';

const colorClasses: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  primary:   { bg: 'bg-primary-100',   text: 'text-primary-600',   darkBg: 'dark:bg-primary-900/30',   darkText: 'dark:text-primary-400' },
  secondary: { bg: 'bg-secondary-100', text: 'text-secondary-600', darkBg: 'dark:bg-secondary-900/30', darkText: 'dark:text-secondary-400' },
  success:   { bg: 'bg-success-100',   text: 'text-success-600',   darkBg: 'dark:bg-success-900/30',   darkText: 'dark:text-success-400' },
  warning:   { bg: 'bg-warning-100',   text: 'text-warning-600',   darkBg: 'dark:bg-warning-900/30',   darkText: 'dark:text-warning-400' },
  danger:    { bg: 'bg-danger-100',    text: 'text-danger-600',    darkBg: 'dark:bg-danger-900/30',    darkText: 'dark:text-danger-400' },
};

const insuranceTypes = [
  { id: 'auto', name: 'Automobile', icon: Car, color: 'primary', desc: 'Véhicules personnels et professionnels', details: 'Responsabilité civile, tous risques, vol, incendie, bris de glace, assistance.' },
  { id: 'habitation', name: 'Habitation', icon: Home, color: 'secondary', desc: 'Maison, appartement, studio', details: 'Incendie, dégât des eaux, vol, responsabilité civile, catastrophes naturelles.' },
  { id: 'sante', name: 'Santé', icon: Heart, color: 'success', desc: 'Couverture médicale complète', details: 'Hospitalisation, consultations, pharmacie, optique, dentaire.' },
  { id: 'voyage', name: 'Voyage', icon: Plane, color: 'warning', desc: 'Protection pendant vos déplacements', details: 'Annulation, rapatriement, bagages, frais médicaux à l\'étranger.' },
  { id: 'vie', name: 'Vie', icon: Shield, color: 'primary', desc: 'Protégez vos proches', details: 'Capital décès, rente éducation, invalidité, épargne.' },
  { id: 'entreprise', name: 'Entreprise', icon: Building2, color: 'secondary', desc: 'Solutions professionnelles', details: 'Multirisque, responsabilité civile, pertes d\'exploitation.' },
  { id: 'flotte', name: 'Flotte', icon: Truck, color: 'warning', desc: 'Gestion de parc automobile', details: 'Assurance groupée véhicules, tarifs dégressifs, gestion simplifiée.' },
  { id: 'responsabilite', name: 'RC Pro', icon: Briefcase, color: 'danger', desc: 'Responsabilité civile professionnelle', details: 'Protection contre les réclamations clients, erreurs professionnelles.' },
];

const steps = ['Choisir un produit', 'Informations', 'Récapitulatif', 'Confirmation'];

const Souscription: React.FC = () => {
  const navigate = useNavigate();
  const { clientProfile } = useClientPortal();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const selectedInsurance = insuranceTypes.find((t) => t.id === selectedType);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!selectedType;
      case 2:
        if (selectedType === 'auto') {
          return !!(formData.marque && formData.modele && formData.immatriculation && formData.usage);
        }
        if (selectedType === 'habitation') {
          return !!(formData.type_logement && formData.surface && formData.adresse);
        }
        return !!(formData.nom && formData.telephone);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const headers = await getApiHeaders(false);
      const response = await fetch(API_ENDPOINTS.clientPortal.createDevis, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type_assurance: selectedType,
          details: {
            ...formData,
            source: 'souscription',
            client_nom: clientProfile?.nom,
            client_prenom: clientProfile?.prenom,
            client_email: clientProfile?.email,
            client_telephone: clientProfile?.telephone,
          },
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        toast.success('Demande de souscription envoyée avec succès');
      } else {
        toast.error(result.message || 'Erreur lors de l\'envoi');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAutoForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Type de véhicule"
          required
          options={[
            { value: 'berline', label: 'Berline' },
            { value: 'suv', label: 'SUV / 4x4' },
            { value: 'utilitaire', label: 'Utilitaire' },
            { value: 'moto', label: 'Moto' },
            { value: 'camion', label: 'Camion' },
          ]}
          value={formData.type_vehicule || ''}
          onChange={(e) => updateField('type_vehicule', e.target.value)}
        />
        <InputField
          label="Marque"
          required
          placeholder="Ex: Toyota, Peugeot..."
          value={formData.marque || ''}
          onChange={(e) => updateField('marque', e.target.value)}
        />
        <InputField
          label="Modèle"
          required
          placeholder="Ex: Corolla, 308..."
          value={formData.modele || ''}
          onChange={(e) => updateField('modele', e.target.value)}
        />
        <InputField
          label="Année"
          type="number"
          placeholder="Ex: 2022"
          value={formData.annee || ''}
          onChange={(e) => updateField('annee', e.target.value)}
        />
        <InputField
          label="Immatriculation"
          required
          placeholder="Ex: DK-1234-AB"
          value={formData.immatriculation || ''}
          onChange={(e) => updateField('immatriculation', e.target.value)}
        />
        <InputField
          label="Puissance fiscale (CV)"
          type="number"
          placeholder="Ex: 7"
          value={formData.puissance_fiscale || ''}
          onChange={(e) => updateField('puissance_fiscale', e.target.value)}
        />
        <SelectField
          label="Usage"
          required
          options={[
            { value: 'personnel', label: 'Personnel' },
            { value: 'professionnel', label: 'Professionnel' },
            { value: 'mixte', label: 'Mixte' },
          ]}
          value={formData.usage || ''}
          onChange={(e) => updateField('usage', e.target.value)}
        />
        <SelectField
          label="Formule souhaitée"
          options={[
            { value: 'tiers', label: 'Tiers' },
            { value: 'tiers_plus', label: 'Tiers+' },
            { value: 'tous_risques', label: 'Tous Risques' },
          ]}
          value={formData.formule || ''}
          onChange={(e) => updateField('formule', e.target.value)}
        />
      </div>
    </div>
  );

  const renderHabitationForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Type de logement"
          required
          options={[
            { value: 'maison', label: 'Maison' },
            { value: 'appartement', label: 'Appartement' },
            { value: 'studio', label: 'Studio' },
            { value: 'villa', label: 'Villa' },
          ]}
          value={formData.type_logement || ''}
          onChange={(e) => updateField('type_logement', e.target.value)}
        />
        <SelectField
          label="Statut d'occupation"
          options={[
            { value: 'proprietaire', label: 'Propriétaire' },
            { value: 'locataire', label: 'Locataire' },
          ]}
          value={formData.statut_occupant || ''}
          onChange={(e) => updateField('statut_occupant', e.target.value)}
        />
        <InputField
          label="Surface (m²)"
          required
          type="number"
          placeholder="Ex: 85"
          value={formData.surface || ''}
          onChange={(e) => updateField('surface', e.target.value)}
        />
        <InputField
          label="Nombre de pièces"
          type="number"
          placeholder="Ex: 4"
          value={formData.nb_pieces || ''}
          onChange={(e) => updateField('nb_pieces', e.target.value)}
        />
      </div>
      <InputField
        label="Adresse du bien"
        required
        placeholder="Adresse complète"
        value={formData.adresse || ''}
        onChange={(e) => updateField('adresse', e.target.value)}
      />
      <InputField
        label="Valeur du contenu (FCFA)"
        type="number"
        placeholder="Ex: 5000000"
        value={formData.valeur_contenu || ''}
        onChange={(e) => updateField('valeur_contenu', e.target.value)}
      />
    </div>
  );

  const renderGenericForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Nom"
          required
          placeholder="Votre nom"
          value={formData.nom || clientProfile?.nom || ''}
          onChange={(e) => updateField('nom', e.target.value)}
        />
        <InputField
          label="Prénom"
          placeholder="Votre prénom"
          value={formData.prenom || clientProfile?.prenom || ''}
          onChange={(e) => updateField('prenom', e.target.value)}
        />
        <InputField
          label="Téléphone"
          required
          placeholder="Votre numéro"
          value={formData.telephone || clientProfile?.telephone || ''}
          onChange={(e) => updateField('telephone', e.target.value)}
        />
        <InputField
          label="Email"
          type="email"
          placeholder="Votre email"
          value={formData.email || clientProfile?.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
        />
      </div>
      <TextAreaField
        label="Besoins spécifiques"
        placeholder="Décrivez vos besoins en assurance..."
        value={formData.besoins || ''}
        onChange={(e) => updateField('besoins', e.target.value)}
      />
    </div>
  );

  const renderFormByType = () => {
    switch (selectedType) {
      case 'auto': return renderAutoForm();
      case 'habitation': return renderHabitationForm();
      default: return renderGenericForm();
    }
  };

  const getFormSummary = (): { label: string; value: string }[] => {
    const items: { label: string; value: string }[] = [
      { label: 'Type d\'assurance', value: selectedInsurance?.name || '' },
    ];

    if (selectedType === 'auto') {
      if (formData.type_vehicule) items.push({ label: 'Type de véhicule', value: formData.type_vehicule });
      if (formData.marque) items.push({ label: 'Marque', value: formData.marque });
      if (formData.modele) items.push({ label: 'Modèle', value: formData.modele });
      if (formData.annee) items.push({ label: 'Année', value: formData.annee });
      if (formData.immatriculation) items.push({ label: 'Immatriculation', value: formData.immatriculation });
      if (formData.puissance_fiscale) items.push({ label: 'Puissance fiscale', value: `${formData.puissance_fiscale} CV` });
      if (formData.usage) items.push({ label: 'Usage', value: formData.usage });
      if (formData.formule) items.push({ label: 'Formule', value: formData.formule });
    } else if (selectedType === 'habitation') {
      if (formData.type_logement) items.push({ label: 'Type de logement', value: formData.type_logement });
      if (formData.statut_occupant) items.push({ label: 'Statut', value: formData.statut_occupant });
      if (formData.surface) items.push({ label: 'Surface', value: `${formData.surface} m²` });
      if (formData.nb_pieces) items.push({ label: 'Pièces', value: formData.nb_pieces });
      if (formData.adresse) items.push({ label: 'Adresse', value: formData.adresse });
      if (formData.valeur_contenu) items.push({ label: 'Valeur contenu', value: `${Number(formData.valeur_contenu).toLocaleString('fr-FR')} FCFA` });
    } else {
      if (formData.nom) items.push({ label: 'Nom', value: `${formData.prenom || ''} ${formData.nom}`.trim() });
      if (formData.telephone) items.push({ label: 'Téléphone', value: formData.telephone });
      if (formData.email) items.push({ label: 'Email', value: formData.email });
      if (formData.besoins) items.push({ label: 'Besoins', value: formData.besoins });
    }

    // Client info
    items.push({ label: 'Client', value: `${clientProfile?.prenom || ''} ${clientProfile?.nom || ''}`.trim() || 'N/A' });
    if (clientProfile?.email) items.push({ label: 'Email client', value: clientProfile.email });
    if (clientProfile?.telephone) items.push({ label: 'Téléphone client', value: clientProfile.telephone });

    return items;
  };

  if (submitted) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-success-600 dark:text-success-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Demande envoyée !</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Votre demande de souscription pour l'assurance {selectedInsurance?.name} a été soumise avec succès.
            Notre équipe vous contactera prochainement pour finaliser votre souscription.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/client/dashboard')}>
              Tableau de bord
            </Button>
            <Button onClick={() => { setSubmitted(false); setCurrentStep(1); setSelectedType(null); setFormData({}); }}>
              Nouvelle demande
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Step 1: Choose Product */}
      {currentStep === 1 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            Choisissez votre assurance
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Sélectionnez le type d'assurance qui correspond à vos besoins.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {insuranceTypes.map((type) => (
              <Card
                key={type.id}
                hover
                onClick={() => { setSelectedType(type.id); setFormData({}); }}
                className={`p-5 text-center ${
                  selectedType === type.id
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
              >
                <div className={`w-14 h-14 ${colorClasses[type.color].bg} ${colorClasses[type.color].darkBg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <type.icon className={`w-7 h-7 ${colorClasses[type.color].text} ${colorClasses[type.color].darkText}`} />
                </div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{type.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.desc}</p>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              icon={ArrowRight}
              iconPosition="right"
              disabled={!selectedType}
              onClick={() => setCurrentStep(2)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Type-specific Form */}
      {currentStep === 2 && selectedInsurance && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 ${colorClasses[selectedInsurance.color].bg} ${colorClasses[selectedInsurance.color].darkBg} rounded-xl flex items-center justify-center`}>
              <selectedInsurance.icon className={`w-7 h-7 ${colorClasses[selectedInsurance.color].text} ${colorClasses[selectedInsurance.color].darkText}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{selectedInsurance.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{selectedInsurance.desc}</p>
            </div>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-primary-800 dark:text-primary-300 mb-1">Garanties incluses</h4>
                <p className="text-sm text-primary-700 dark:text-primary-400">{selectedInsurance.details}</p>
              </div>
            </div>
          </div>

          {renderFormByType()}

          <div className="flex justify-between mt-6">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setCurrentStep(1)}>
              Retour
            </Button>
            <Button icon={ArrowRight} iconPosition="right" disabled={!canGoNext()} onClick={() => setCurrentStep(3)}>
              Suivant
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Summary */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Récapitulatif</h3>
          <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            {getFormSummary().map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white text-right max-w-[60%]">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setCurrentStep(2)}>
              Retour
            </Button>
            <Button
              icon={Send}
              iconPosition="right"
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
            >
              Envoyer la demande
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Souscription;
