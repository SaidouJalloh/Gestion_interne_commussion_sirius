import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Home, Heart, Plane, Shield, Building2, Truck, Briefcase,
  ArrowRight, ArrowLeft, CheckCircle2, Info, Phone, Mail,
} from 'lucide-react';
import { Card, Button, StepIndicator } from '../components/ui';
import { useClientPortal } from '../../context/ClientPortalContext';

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

const steps = ['Choisir un produit', 'Détails du produit', 'Informations', 'Confirmation'];

const Souscription: React.FC = () => {
  const navigate = useNavigate();
  const { clientProfile } = useClientPortal();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const selectedInsurance = insuranceTypes.find((t) => t.id === selectedType);

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
                onClick={() => setSelectedType(type.id)}
                className={`p-5 text-center ${
                  selectedType === type.id
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : ''
                }`}
              >
                <div className={`w-14 h-14 bg-${type.color}-100 dark:bg-${type.color}-900/30 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <type.icon className={`w-7 h-7 text-${type.color}-600 dark:text-${type.color}-400`} />
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

      {/* Step 2: Product Details */}
      {currentStep === 2 && selectedInsurance && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 bg-${selectedInsurance.color}-100 dark:bg-${selectedInsurance.color}-900/30 rounded-xl flex items-center justify-center`}>
              <selectedInsurance.icon className={`w-7 h-7 text-${selectedInsurance.color}-600 dark:text-${selectedInsurance.color}-400`} />
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

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">Pour souscrire</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              La souscription en ligne sera bientôt disponible. En attendant, vous pouvez nous
              contacter pour finaliser votre souscription ou demander un devis personnalisé.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                icon={Phone}
                size="sm"
                onClick={() => {/* Contact */}}
              >
                Nous appeler
              </Button>
              <Button
                variant="secondary"
                icon={Mail}
                size="sm"
                onClick={() => navigate('/client/devis')}
              >
                Demander un devis
              </Button>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setCurrentStep(1)}>
              Retour
            </Button>
            <Button icon={ArrowRight} iconPosition="right" onClick={() => setCurrentStep(3)}>
              Continuer
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: User Information */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Vos informations</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Nom</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">
                {clientProfile?.prenom} {clientProfile?.nom}
              </span>
            </div>
            {clientProfile?.email && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{clientProfile.email}</span>
              </div>
            )}
            {clientProfile?.telephone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Téléphone</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">{clientProfile.telephone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Type d'assurance</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedInsurance?.name}</span>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setCurrentStep(2)}>
              Retour
            </Button>
            <Button icon={ArrowRight} iconPosition="right" onClick={() => setCurrentStep(4)}>
              Confirmer
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && (
        <div className="text-center">
          <Card className="p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Demande enregistrée !</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Votre intérêt pour l'assurance {selectedInsurance?.name} a été noté.
              Notre équipe vous contactera prochainement pour finaliser votre souscription.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => navigate('/client/dashboard')}>
                Tableau de bord
              </Button>
              <Button onClick={() => navigate('/client/devis')}>
                Demander un devis
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Souscription;
