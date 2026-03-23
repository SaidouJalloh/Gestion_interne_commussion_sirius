import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';

type DeleteConfirmModalProps = {
  compagnieId: string | null;
  onConfirm: (id: string) => void;
  onCancel: () => void;
};

export const DeleteConfirmModal: FC<DeleteConfirmModalProps> = ({
  compagnieId,
  onConfirm,
  onCancel,
}) => {
  if (!compagnieId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-in border border-slate-100">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Confirmer la suppression
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Cette action est irréversible
              </p>
            </div>
          </div>
          <p className="text-slate-600 mb-6 font-medium">
            Êtes-vous sûr de vouloir supprimer cette compagnie ? Toutes les
            données associées seront perdues.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => onConfirm(compagnieId)}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold transition-all shadow-sm hover:shadow-md"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


