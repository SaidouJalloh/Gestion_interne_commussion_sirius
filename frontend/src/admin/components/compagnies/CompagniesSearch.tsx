import type { FC, ChangeEvent } from 'react';
import { Search } from 'lucide-react';

type CompagniesSearchProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

export const CompagniesSearch: FC<CompagniesSearchProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher une compagnie..."
          value={searchTerm}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white shadow-sm font-medium text-slate-700"
        />
      </div>
    </div>
  );
};


