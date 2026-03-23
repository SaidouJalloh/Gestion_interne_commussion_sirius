import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Home, Heart, Plane, Shield, Building2, Truck, Briefcase,
  CheckCircle2, ArrowRight, ArrowLeft, Send, Loader2,
} from 'lucide-react';
import { Card, Button, InputField, SelectField, TextAreaField, StepIndicator } from '../components/ui';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';
import toast from 'react-hot-toast';

const insuranceTypes = [
  { id: 'auto', name: 'Automobile', icon: Car, color: 'primary', desc: 'Véhicules personnels et professionnels' },
  { id: 'habitation', name: 'Habitation', icon: Home, color: 'secondary', desc: 'Maison, appartement, studio' },
  { id: 'sante', name: 'Santé', icon: Heart, color: 'success', desc: 'Couverture médicale complète' },
  { id: 'voyage', name: 'Voyage', icon: Plane, color: 'warning', desc: 'Protection pendant vos déplacements' },
  { id: 'vie', name: 'Vie', icon: Shield, color: 'primary', desc: 'Protégez vos proches' },
  { id: 'entreprise', name: 'Entreprise', icon: Building2, color: 'secondary', desc: 'Solutions professionnelles' },
  { id: 'flotte', name: 'Flotte', icon: Truck, color: 'warning', desc: 'Gestion de parc automobile' },
  { id: 'responsabilite', name: 'RC Pro', icon: Briefcase, color: 'danger', desc: 'Responsabilité civile professionnelle' },
];

const steps = ['Type d\'assurance', 'Informations', 'Confirmation'];

const DemandeDevis: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    notes: '',
  });

  const selectedInsurance = insuranceTypes.find((t) => t.id === selectedType);

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
          details: formData,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        toast.success('Demande de devis envoyée avec succès');
      } else {
        toast.error(result.message || 'Erreur lors de l\'envoi');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
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
            Votre demande de devis pour {selectedInsurance?.name} a été soumise.
            Notre équipe vous contactera rapidement.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => navigate('/client/dashboard')}>
              Retour au tableau de bord
            </Button>
            <Button onClick={() => { setSubmitted(false); setCurrentStep(1); setSelectedType(null); }}>
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

      {/* Step 1: Select Type */}
      {currentStep === 1 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Quel type d'assurance vous intéresse ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {insuranceTypes.map((type) => (
              <Card
                key={type.id}
                hover
                onClick={() => setSelectedType(type.id)}
                className={`p-4 text-center ${
                  selectedType === type.id
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
              >
                <div className={`w-12 h-12 bg-${type.color}-100 dark:bg-${type.color}-900/30 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <type.icon className={`w-6 h-6 text-${type.color}-600 dark:text-${type.color}-400`} />
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

      {/* Step 2: Information */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            Vos informations pour le devis {selectedInsurance?.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nom"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Votre nom"
            />
            <InputField
              label="Prénom"
              required
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              placeholder="Votre prénom"
            />
            <InputField
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              placeholder="Votre numéro"
            />
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Votre email"
            />
          </div>
          <div className="mt-4">
            <TextAreaField
              label="Précisions ou besoins spécifiques"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Décrivez vos besoins..."
            />
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setCurrentStep(1)}>
              Retour
            </Button>
            <Button icon={ArrowRight} iconPosition="right" onClick={() => setCurrentStep(3)}>
              Suivant
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Récapitulatif</h3>
          <div className="space-y-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Type d'assurance</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedInsurance?.name}</span>
            </div>
            {formData.nom && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Nom complet</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {formData.prenom} {formData.nom}
                </span>
              </div>
            )}
            {formData.telephone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Téléphone</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{formData.telephone}</span>
              </div>
            )}
            {formData.email && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{formData.email}</span>
              </div>
            )}
            {formData.notes && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Notes</span>
                <p className="text-sm text-gray-800 dark:text-white mt-1">{formData.notes}</p>
              </div>
            )}
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

export default DemandeDevis;
