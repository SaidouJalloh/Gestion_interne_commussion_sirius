import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Car, Home, Heart, Shield, Calendar, ChevronRight } from 'lucide-react';
import { useClientContrats } from '../hooks/useClientContrats';
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

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

const Contrats: React.FC = () => {
  const { contrats, loading, error } = useClientContrats();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-danger-100 dark:bg-danger-900/30 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-danger-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Erreur de chargement
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (contrats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
          <FileCheck className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Aucun contrat
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Vous n'avez pas encore de contrat enregistr\u00e9.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{contrats.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total contrats</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-success-600 dark:text-success-400">
            {contrats.filter((c: any) => c.statut === 'actif').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Actifs</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
            {contrats.filter((c: any) => c.statut === 'en_attente' || c.statut === 'suspendu').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">En attente</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
            {contrats.filter((c: any) => c.statut === 'expire' || c.statut === 'resilie').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Expir\u00e9s / R\u00e9sili\u00e9s</p>
        </Card>
      </div>

      {/* Contract list */}
      {contrats.map((contrat: any) => {
        const IconComponent = typeIcons[contrat.type_contrat] || FileCheck;
        const statut = statutConfig[contrat.statut] || { label: contrat.statut, variant: 'secondary' as const };

        return (
          <Card
            key={contrat.id}
            hover
            onClick={() => navigate(`/client/contrats/${contrat.id}`)}
            className="p-5"
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {formatTypeContrat(contrat.type_contrat)}
                  </h3>
                  <Badge variant={statut.variant}>{statut.label}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {contrat.compagnies?.nom && (
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      {contrat.compagnies.nom}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(contrat.date_effet)} — {formatDate(contrat.date_expiration)}
                  </span>
                  {contrat.numero_police && (
                    <span className="text-gray-400 dark:text-gray-500">
                      N\u00b0 {contrat.numero_police}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default Contrats;
