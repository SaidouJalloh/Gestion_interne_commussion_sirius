import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  Calendar,
  Calculator,
  Plus,
  FileText,
  AlertTriangle,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useClientDashboard } from '../hooks/useClientDashboard';
import { useClientPortal } from '../../context/ClientPortalContext';
import { Card, Badge, ProgressBar } from '../components/ui';

const statusBadgeVariant = (status: string) => {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'secondary'> = {
    actif: 'success',
    active: 'success',
    en_cours: 'warning',
    en_attente: 'warning',
    pending: 'warning',
    expire: 'danger',
    rejected: 'danger',
    refuse: 'danger',
    cloture: 'secondary',
    closed: 'secondary',
    termine: 'secondary',
  };
  return map[status?.toLowerCase()] || 'primary';
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { clientProfile } = useClientPortal();
  const { data, loading, error } = useClientDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-danger-500" />
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">{error}</p>
      </div>
    );
  }

  const stats = data?.stats;
  const prochainRenouvellement = stats?.prochain_renouvellement;

  const statCards = [
    {
      label: 'Contrats Actifs',
      value: stats?.contrats_actifs ?? 0,
      icon: FileCheck,
      color: 'primary',
      bgClass: 'bg-primary-50 dark:bg-primary-900/20',
      iconClass: 'text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Sinistres en Cours',
      value: stats?.sinistres_en_cours ?? 0,
      icon: Clock,
      color: 'warning',
      bgClass: 'bg-warning-50 dark:bg-warning-900/20',
      iconClass: 'text-warning-600 dark:text-warning-400',
    },
    {
      label: 'Prochaine Echeance',
      value: prochainRenouvellement ? formatDate(prochainRenouvellement.date_expiration) : 'N/A',
      subtitle: prochainRenouvellement?.type_contrat || undefined,
      icon: Calendar,
      color: 'accent',
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      iconClass: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Devis en Attente',
      value: stats?.devis_en_attente ?? 0,
      icon: Calculator,
      color: 'success',
      bgClass: 'bg-success-50 dark:bg-success-900/20',
      iconClass: 'text-success-600 dark:text-success-400',
    },
  ];

  const quickActions = [
    {
      label: 'Nouvelle Souscription',
      icon: Plus,
      path: '/client/souscription',
      gradient: 'bg-gradient-to-br from-primary-500 to-primary-600',
    },
    {
      label: 'Demander un Devis',
      icon: FileText,
      path: '/client/devis',
      gradient: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
    },
    {
      label: 'Declarer un Sinistre',
      icon: AlertTriangle,
      path: '/client/sinistre/declarer',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonjour{clientProfile?.prenom ? `, ${clientProfile.prenom}` : ''} !
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Voici un apercu de votre espace client.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">{stat.subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgClass}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconClass}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.gradient} text-white rounded-xl p-4 flex items-center gap-3 hover:opacity-90 hover:shadow-lg transition-all duration-200`}
            >
              <action.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{action.label}</span>
              <ArrowRight className="w-4 h-4 ml-auto flex-shrink-0" />
            </button>
          ))}
        </div>
      </Card>

      {/* Contrats & Sinistres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes Contrats */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mes Contrats</h2>
            <button
              onClick={() => navigate('/client/contrats')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Voir tout
            </button>
          </div>
          {data?.derniers_contrats && data.derniers_contrats.length > 0 ? (
            <div className="space-y-3">
              {data.derniers_contrats.map((contrat: any, index: number) => (
                <div
                  key={contrat.id || index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {contrat.type_contrat || contrat.type || 'Contrat'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Expire le {formatDate(contrat.date_expiration || contrat.expiry_date)}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(contrat.statut || contrat.status)}>
                    {contrat.statut || contrat.status || 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              Aucun contrat pour le moment.
            </p>
          )}
        </Card>

        {/* Suivi Sinistres */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Suivi Sinistres
            </h2>
            <button
              onClick={() => navigate('/client/sinistres')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Voir tout
            </button>
          </div>
          {data?.derniers_sinistres && data.derniers_sinistres.length > 0 ? (
            <div className="space-y-3">
              {data.derniers_sinistres.map((sinistre: any, index: number) => (
                <div
                  key={sinistre.id || index}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {sinistre.type_sinistre || sinistre.type || 'Sinistre'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDate(sinistre.date_sinistre || sinistre.date || sinistre.created_at)}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(sinistre.statut || sinistre.status)}>
                    {sinistre.statut || sinistre.status || 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
              Aucun sinistre pour le moment.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
