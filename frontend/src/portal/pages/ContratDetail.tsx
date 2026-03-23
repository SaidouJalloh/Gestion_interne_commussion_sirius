import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileCheck,
  Car,
  Home,
  Heart,
  Shield,
  Calendar,
  Building2,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { API_ENDPOINTS, getApiHeaders } from '../../config/api';
import { Card, Badge } from '../components/ui';

const typeIcons: Record<string, React.ElementType> = {
  automobile: Car,
  habitation: Home,
  sante: Heart,
  vie: Heart,
  rc_professionnelle: Shield,
  multirisque: Shield,
};

const statutConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' | 'primary' }> = {
  actif: { label: 'Actif', variant: 'success' },
  en_attente: { label: 'En attente', variant: 'warning' },
  suspendu: { label: 'Suspendu', variant: 'warning' },
  expire: { label: 'Expir\u00e9', variant: 'danger' },
  resilie: { label: 'R\u00e9sili\u00e9', variant: 'danger' },
  annule: { label: 'Annul\u00e9', variant: 'secondary' },
};

const paiementStatutConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  paye: { label: 'Pay\u00e9', icon: CheckCircle2, color: 'text-success-600 dark:text-success-400' },
  en_attente: { label: 'En attente', icon: Clock, color: 'text-warning-600 dark:text-warning-400' },
  partiel: { label: 'Partiel', icon: AlertCircle, color: 'text-warning-600 dark:text-warning-400' },
  impaye: { label: 'Impay\u00e9', icon: XCircle, color: 'text-danger-600 dark:text-danger-400' },
  annule: { label: 'Annul\u00e9', icon: XCircle, color: 'text-gray-400 dark:text-gray-500' },
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return '-';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
};

const formatTypeContrat = (type: string) => {
  const labels: Record<string, string> = {
    automobile: 'Automobile',
    habitation: 'Habitation',
    sante: 'Sant\u00e9',
    vie: 'Vie',
    rc_professionnelle: 'RC Professionnelle',
    multirisque: 'Multirisque',
    voyage: 'Voyage',
    responsabilite_civile: 'Responsabilit\u00e9 Civile',
  };
  return labels[type] || type;
};

const ContratDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contrat, setContrat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContrat = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const headers = await getApiHeaders(false);
        const response = await fetch(API_ENDPOINTS.clientPortal.contratById(id), { headers });
        const result = await response.json();
        if (result.success) {
          setContrat(result.data);
        } else {
          setError(result.message || 'Contrat non trouv\u00e9');
        }
      } catch (e: any) {
        setError(e.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchContrat();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !contrat) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/client/contrats')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux contrats
        </button>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-danger-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Contrat introuvable
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error || 'Ce contrat n\'existe pas ou vous n\'y avez pas acc\u00e8s.'}
          </p>
        </div>
      </div>
    );
  }

  const IconComponent = typeIcons[contrat.type_contrat] || FileCheck;
  const statut = statutConfig[contrat.statut] || { label: contrat.statut, variant: 'secondary' as const };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/client/contrats')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux contrats
      </button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {formatTypeContrat(contrat.type_contrat)}
              </h2>
              <Badge variant={statut.variant}>{statut.label}</Badge>
            </div>
            {contrat.numero_police && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Police N\u00b0 {contrat.numero_police}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General info */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary-500" />
            Informations g\u00e9n\u00e9rales
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Type</dt>
              <dd className="text-sm font-medium text-gray-800 dark:text-white">
                {formatTypeContrat(contrat.type_contrat)}
              </dd>
            </div>
            {contrat.compagnies?.nom && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Compagnie
                </dt>
                <dd className="text-sm font-medium text-gray-800 dark:text-white">
                  {contrat.compagnies.nom}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date d'effet
              </dt>
              <dd className="text-sm font-medium text-gray-800 dark:text-white">
                {formatDate(contrat.date_effet)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date d'expiration
              </dt>
              <dd className="text-sm font-medium text-gray-800 dark:text-white">
                {formatDate(contrat.date_expiration)}
              </dd>
            </div>
            {contrat.duree && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Dur\u00e9e</dt>
                <dd className="text-sm font-medium text-gray-800 dark:text-white">
                  {contrat.duree}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Financial info */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary-500" />
            Informations financi\u00e8res
          </h3>
          <dl className="space-y-3">
            {contrat.prime_nette != null && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Prime nette</dt>
                <dd className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatCurrency(contrat.prime_nette)}
                </dd>
              </div>
            )}
            {contrat.prime_ttc != null && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Prime TTC</dt>
                <dd className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {formatCurrency(contrat.prime_ttc)}
                </dd>
              </div>
            )}
            {contrat.fractionnement && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Fractionnement</dt>
                <dd className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                  {contrat.fractionnement}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {/* Linked vehicle */}
      {contrat.vehicules && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-primary-500" />
            V\u00e9hicule assur\u00e9
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contrat.vehicules.marque && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Marque</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {contrat.vehicules.marque}
                  </p>
                </div>
              )}
              {contrat.vehicules.modele && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mod\u00e8le</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {contrat.vehicules.modele}
                  </p>
                </div>
              )}
              {contrat.vehicules.immatriculation && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Immatriculation</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {contrat.vehicules.immatriculation}
                  </p>
                </div>
              )}
              {contrat.vehicules.annee && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ann\u00e9e</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {contrat.vehicules.annee}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Payment history */}
      {contrat.paiements && contrat.paiements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary-500" />
            Historique des paiements
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3">
                    Montant
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3">
                    Mode
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 pb-3">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {contrat.paiements.map((p: any) => {
                  const pStatut = paiementStatutConfig[p.statut] || {
                    label: p.statut,
                    icon: Clock,
                    color: 'text-gray-500',
                  };
                  const PIcon = pStatut.icon;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                        {formatDate(p.date_paiement)}
                      </td>
                      <td className="py-3 text-sm font-medium text-gray-800 dark:text-white">
                        {formatCurrency(p.montant)}
                      </td>
                      <td className="py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {p.mode_paiement || '-'}
                      </td>
                      <td className="py-3">
                        <span className={`flex items-center gap-1 text-sm ${pStatut.color}`}>
                          <PIcon className="w-3.5 h-3.5" />
                          {pStatut.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ContratDetail;
