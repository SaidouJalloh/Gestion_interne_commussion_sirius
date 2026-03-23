import type { FC } from 'react';
import { Edit2, Trash2, Settings } from 'lucide-react';
import type { Tables } from '../../../types/supabase';
import { getInitials } from '../../utils/compagnieHelpers';

type CompagnieRow = Tables<'compagnies'>;

type CompagnieCardProps = {
  compagnie: CompagnieRow;
  onEdit: (compagnie: CompagnieRow) => void;
  onDelete: (id: string) => void;
  onEditTaux: (compagnie: CompagnieRow) => void;
  canDelete?: boolean;
};

export const CompagnieCard: FC<CompagnieCardProps> = ({
  compagnie,
  onEdit,
  onDelete,
  onEditTaux,
  canDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {compagnie.logo_url ? (
              <img
                src={compagnie.logo_url}
                alt={compagnie.nom ?? ''}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.style.display = 'none';
                  const next = img.nextElementSibling as HTMLElement | null;
                  if (next) {
                    next.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                compagnie.logo_url ? 'hidden' : ''
              }`}
            >
              {getInitials(compagnie.sigle ?? '')}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{compagnie.nom}</h3>
              <p className="text-sm font-medium text-slate-500">{compagnie.sigle}</p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              compagnie.actif
                ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {compagnie.actif ? 'Actif' : 'Inactif'}
          </span>
        </div>

        {compagnie.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
            {compagnie.description}
          </p>
        )}

        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
            Types d&apos;assurances
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {Object.keys((compagnie.taux_commissions as Record<string, unknown>) || {}).length}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEditTaux(compagnie)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50/50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-100/50"
          >
            <Settings className="w-4 h-4" />
            Gérer les taux
          </button>
          <button
            type="button"
            onClick={() => onEdit(compagnie)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(compagnie.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


