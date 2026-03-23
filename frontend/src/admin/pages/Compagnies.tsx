// code optimisé rapide (TypeScript)
import { useState, useCallback, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { useProfileContext } from '../../context/ProfileContext';
import { useCompagniesData } from '../hooks/useCompagniesData';
import { useCompagniesMutations } from '../hooks/useCompagniesMutations';
import { CompagniesHeader } from '../components/compagnies/CompagniesHeader';
import { CompagniesSearch } from '../components/compagnies/CompagniesSearch';
import { CompagnieCard } from '../components/compagnies/CompagnieCard';
import { CompagnieModal } from '../components/compagnies/CompagnieModal';
import { TauxModal } from '../components/compagnies/TauxModal';
import { DeleteConfirmModal } from '../components/compagnies/DeleteConfirmModal';
import toast from 'react-hot-toast';
import type { Tables } from '../../types/supabase';

type Compagnie = Tables<'compagnies'>;
type Profile = Tables<'profiles'>;

type CompagnieFormData = {
  nom: string;
  sigle: string;
  description: string;
  logo_url: string;
  lien_souscription: string;
  actif: boolean;
};

interface ProfileContextValue {
  profile: Profile | null;
  status: 'loading' | 'loaded' | 'not_found' | 'error';
  error: Error | null;
  refresh: () => Promise<Profile | null>;
}

export default function Compagnies() {
  const { profile } = useProfileContext() as ProfileContextValue;
  const { compagnies, loading, refetch } = useCompagniesData();
  const { deleteCompagnie } = useCompagniesMutations();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCompagnie, setSelectedCompagnie] =
    useState<Compagnie | null>(null);
  const [editTauxModal, setEditTauxModal] = useState<Compagnie | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<CompagnieFormData>({
    nom: '',
    sigle: '',
    description: '',
    logo_url: '',
    lien_souscription: '',
    actif: true,
  });

  // ⚡ OPTIMISATION : Memoize le filtrage
  const filteredCompagnies = useMemo<Compagnie[]>(() => {
    // Sécurité : s'assurer que compagnies est bien un tableau
    const companiesArray = Array.isArray(compagnies) ? compagnies : [];

    if (!searchTerm) return companiesArray;

    const search = searchTerm.toLowerCase();
    return companiesArray.filter((compagnie) => {
      const nom = (compagnie.nom ?? '').toLowerCase();
      const sigle = (compagnie.sigle ?? '').toLowerCase();
      return nom.includes(search) || sigle.includes(search);
    });
  }, [compagnies, searchTerm]);

  // ⚡ OPTIMISATION : useCallback pour reset
  const resetForm = useCallback(() => {
    setFormData({
      nom: '',
      sigle: '',
      description: '',
      logo_url: '',
      lien_souscription: '',
      actif: true,
    });
  }, []);

  // ⚡ OPTIMISATION : useCallback pour handleAdd
  const handleAdd = useCallback(() => {
    resetForm();
    setSelectedCompagnie(null);
    setIsModalOpen(true);
  }, [resetForm]);

  // ⚡ OPTIMISATION : useCallback pour handleEdit
  const handleEdit = useCallback((compagnie: Compagnie) => {
    setSelectedCompagnie(compagnie);
    setFormData({
      nom: compagnie.nom || '',
      sigle: compagnie.sigle || '',
      description: compagnie.description || '',
      logo_url: compagnie.logo_url || '',
      lien_souscription: compagnie.lien_souscription || '',
      actif: compagnie.actif ?? true,
    });
    setIsModalOpen(true);
  }, []);

  // ⚡ OPTIMISATION : useCallback pour handleDelete
  const handleDelete = useCallback(
    async (compagnieId: string) => {
      try {
        const promise = deleteCompagnie(compagnieId);

        await toast.promise(promise, {
          loading: 'Suppression...',
          success: 'Compagnie supprimée ! 🗑️',
          error: 'Erreur lors de la suppression',
        });

        await refetch();
        setDeleteConfirm(null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erreur:', error);
      }
    },
    [deleteCompagnie, refetch],
  );

  // ⚡ OPTIMISATION : useCallback pour openEditTaux
  const openEditTaux = useCallback((compagnie: Compagnie) => {
    setEditTauxModal(compagnie);
  }, []);

  // ⚡ OPTIMISATION : useCallback pour closeModal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedCompagnie(null);
    resetForm();
  }, [resetForm]);

  const canDelete = profile?.role === 'admin' || profile?.role === 'superadmin';

  return (
    <div className="animate-fade-in">
      <CompagniesHeader count={filteredCompagnies.length} onAdd={handleAdd} />

      <CompagniesSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      ) : filteredCompagnies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-lg font-medium">
            Aucune compagnie trouvée
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompagnies.map((compagnie) => (
            <CompagnieCard
              key={compagnie.id}
              compagnie={compagnie}
              onEdit={handleEdit}
              onDelete={(id: string) => setDeleteConfirm(id)}
              onEditTaux={openEditTaux}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      <CompagnieModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedCompagnie={selectedCompagnie}
        formData={formData}
        setFormData={setFormData}
        onSuccess={async () => {
          // 1. Ferme le modal
          closeModal();

          // 2. Affiche le toast
          toast.success(
            selectedCompagnie
              ? 'Compagnie mise à jour ! 🎉'
              : 'Compagnie créée ! 🎉',
          );

          // 3. Refetch avec délai
          setTimeout(async () => {
            await refetch();
          }, 400);
        }}
      />

      <TauxModal
        compagnie={editTauxModal}
        onClose={() => setEditTauxModal(null)}
        onSuccess={async () => {
          await refetch(); // Premier refetch
          setTimeout(async () => {
            await refetch(); // Deuxième refetch après 1s
          }, 1000);
        }}
      />

      <DeleteConfirmModal
        compagnieId={deleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}


