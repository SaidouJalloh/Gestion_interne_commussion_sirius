import type { FC } from 'react';
import { Plus } from 'lucide-react';

type CompagniesHeaderProps = {
  count: number;
  onAdd: () => void;
};

export const CompagniesHeader: FC<CompagniesHeaderProps> = ({
  count,
  onAdd,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Compagnies d&apos;Assurance
          </h1>
          <p className="text-gray-600 mt-1">
            {count} compagnie
            {count > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onAdd}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter une compagnie
        </button>
      </div>
    </div>
  );
};


