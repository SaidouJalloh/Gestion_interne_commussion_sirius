import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { useClientSinistres } from '../hooks/useClientSinistres';
import { Card, Badge } from '../components/ui';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  recu: { label: 'Recu', variant: 'primary' },
  en_cours: { label: 'En cours', variant: 'warning' },
  expertise: { label: 'Expertise', variant: 'primary' },
  traite: { label: 'Traite', variant: 'success' },
  cloture: { label: 'Cloture', variant: 'secondary' },
  rejete: { label: 'Rejete', variant: 'danger' },
};

const getStatusInfo = (statut: string) =>
  STATUS_MAP[statut?.toLowerCase()] || { label: statut || 'N/A', variant: 'primary' as BadgeVariant };

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

const Sinistres: React.FC = () => {
  const navigate = useNavigate();
  const { sinistres, loading, error } = useClientSinistres();

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes Sinistres</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Suivez l'avancement de vos declarations de sinistres.
          </p>
        </div>
        <button
          onClick={() => navigate('/client/sinistre/declarer')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Declarer un sinistre
        </button>
      </div>

      {/* Claims List */}
      {sinistres.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full">
              <AlertTriangle className="w-10 h-10 text-gray-300 dark:text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Aucun sinistre declare
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Vos declarations de sinistres apparaitront ici.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sinistres.map((sinistre: any) => {
            const statusInfo = getStatusInfo(sinistre.statut);
            return (
              <Card
                key={sinistre.id}
                hover
                onClick={() => navigate(`/client/sinistres/${sinistre.id}`)}
                className="p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {sinistre.numero_sinistre || 'N/A'}
                      </p>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {sinistre.type_sinistre || 'Sinistre'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(sinistre.date_sinistre)}</span>
                      {sinistre.contrats?.type_contrat && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                          <span>{sinistre.contrats.type_contrat}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Sinistres;
