import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usePaymentsData } from '../../hooks/usePaymentsData';
import { usePaymentsMutations } from '../../hooks/usePaymentsMutations';

// Typage volontairement permissif pour ne pas bloquer la migration TS/TSX.
// On raffinerа plus tard (contrats + relations clients/compagnies).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContratLike = any;

type PaiementsModalProps = {
  contrat: ContratLike | null;
  onClose: () => void;
};

type PaymentFormState = {
  type_paiement: string;
  montant: string;
  date_paiement: string; // YYYY-MM-DD
  mode_paiement: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const toDateInputValue = (value: unknown): string => {
  if (typeof value === 'string' && value.length >= 10) return value.slice(0, 10);
  return today();
};

export const PaiementsModal = ({ contrat, onClose }: PaiementsModalProps) => {
  const contractId = contrat?.id as string | undefined;

  const query = useMemo(() => ({ contractId }), [contractId]);
  const { payments: paiements, loading, refetch } = usePaymentsData(query);
  const { createPayment, updatePayment, deletePayment } = usePaymentsMutations();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingPaiement, setEditingPaiement] = useState<any>(null);

  const [paiementForm, setPaiementForm] = useState<PaymentFormState>({
    type_paiement: 'client_prime',
    montant: '',
    date_paiement: today(),
    mode_paiement: '',
    notes: '',
  });

  useEffect(() => {
    if (contrat) {
      // Reset form à chaque ouverture/changement de contrat
      setEditingPaiement(null);
      setPaiementForm({
        type_paiement: 'client_prime',
        montant: '',
        date_paiement: today(),
        mode_paiement: '',
        notes: '',
      });
    }
  }, [contrat]);

  const handlePaiementChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setPaiementForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingPaiement(null);
    setPaiementForm({
      type_paiement: 'client_prime',
      montant: '',
      date_paiement: today(),
      mode_paiement: '',
      notes: '',
    });
  };

  const handleAddPaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contrat?.id) return;

    try {
      await createPayment({
        contrat_id: contrat.id,
        type_paiement: paiementForm.type_paiement,
        montant: Number(paiementForm.montant),
        date_paiement: paiementForm.date_paiement,
        mode_paiement: paiementForm.mode_paiement,
        notes: paiementForm.notes?.trim() ? paiementForm.notes.trim() : null,
      });

      toast.success('Paiement ajouté');
      await refetch();
      resetForm();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : 'Erreur lors de la création du paiement');
    }
  };

  const handleEditPaiement = (paiement: any) => {
    setEditingPaiement(paiement);
    setPaiementForm({
      type_paiement: paiement.type_paiement ?? 'client_prime',
      montant: paiement.montant != null ? String(paiement.montant) : '',
      date_paiement: toDateInputValue(paiement.date_paiement),
      mode_paiement: paiement.mode_paiement ?? '',
      notes: paiement.notes ?? '',
    });
  };

  const handleUpdatePaiement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPaiement?.id) return;

    try {
      await updatePayment(editingPaiement.id, {
        contrat_id: contrat?.id,
        type_paiement: paiementForm.type_paiement,
        montant: Number(paiementForm.montant),
        date_paiement: paiementForm.date_paiement,
        mode_paiement: paiementForm.mode_paiement,
        notes: paiementForm.notes?.trim() ? paiementForm.notes.trim() : null,
      });

      toast.success('Paiement mis à jour');
      await refetch();
      resetForm();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : 'Erreur lors de la mise à jour');
    }
  };

  const handleDeletePaiement = async (paiementId: string) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;

    try {
      await deletePayment(paiementId);
      toast.success('Paiement supprimé');
      await refetch();
    } catch (error: any) {
      toast.error(error?.message ? String(error.message) : 'Erreur lors de la suppression');
    }
  };

  const getTotalPaye = (type: string) => {
    return (paiements || [])
      .filter((p: any) => p.type_paiement === type)
      .reduce((sum: number, p: any) => sum + Number(p.montant ?? 0), 0);
  };

  if (!contrat) return null;

  const primeTtc = Number(contrat.prime_ttc ?? 0);
  const commission = Number(contrat.commission ?? 0);

  const totalPrimePayee = getTotalPaye('client_prime');
  const totalCommissionPayee = getTotalPaye('commission_compagnie');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-strong max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                Paiements - {contrat.clients?.nom} {contrat.clients?.prenom}
              </h2>
              <p className="text-sm text-gray-600">
                {String(contrat.type_contrat ?? '').replace(/_/g, ' ')} - {contrat.compagnies?.nom}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Résumé */}
          <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-600 mb-1">Prime TTC totale</p>
              <p className="text-lg font-bold text-blue-600">{primeTtc.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-success-600 mt-1">
                Payé: {totalPrimePayee.toLocaleString('fr-FR')} FCFA
              </p>
              <p className="text-xs text-warning-600">
                Restant: {(primeTtc - totalPrimePayee).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Commission totale</p>
              <p className="text-lg font-bold text-primary-600">{commission.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-success-600 mt-1">
                Reçu: {totalCommissionPayee.toLocaleString('fr-FR')} FCFA
              </p>
              <p className="text-xs text-warning-600">
                Restant: {(commission - totalCommissionPayee).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>

          {/* Formulaire paiement */}
          <form
            onSubmit={editingPaiement ? handleUpdatePaiement : handleAddPaiement}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <h3 className="font-semibold text-blue-900 mb-3">
              {editingPaiement ? 'Modifier' : 'Ajouter'} un paiement
            </h3>
            <div className="grid md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-1">Type</label>
                <select
                  name="type_paiement"
                  value={paiementForm.type_paiement}
                  onChange={handlePaiementChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                  required
                >
                  <option value="client_prime">Prime client</option>
                  <option value="commission_compagnie">Commission</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-1">Montant (FCFA)</label>
                <input
                  type="number"
                  name="montant"
                  value={paiementForm.montant}
                  onChange={handlePaiementChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-1">Date</label>
                <input
                  type="date"
                  name="date_paiement"
                  value={paiementForm.date_paiement}
                  onChange={handlePaiementChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-1">Mode</label>
                <select
                  name="mode_paiement"
                  value={paiementForm.mode_paiement}
                  onChange={handlePaiementChange}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                  required
                >
                  <option value="">Sélectionner</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="carte_bancaire">Carte</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {editingPaiement ? 'Modifier' : 'Ajouter'}
                </button>
                {editingPaiement && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Liste paiements */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Historique ({(paiements || []).length})</h3>

            {loading ? (
              <p className="text-gray-500 text-center py-8">Chargement...</p>
            ) : (paiements || []).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucun paiement enregistré</p>
            ) : (
              <div className="space-y-2">
                {(paiements || []).map((paiement: any) => (
                  <div
                    key={paiement.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${paiement.type_paiement === 'client_prime'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                          }`}
                      >
                        {paiement.type_paiement === 'client_prime' ? 'Prime' : 'Commission'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {Number(paiement.montant ?? 0).toLocaleString('fr-FR')} FCFA
                        </p>
                        <p className="text-xs text-gray-500">
                          {paiement.date_paiement
                            ? new Date(paiement.date_paiement).toLocaleDateString('fr-FR')
                            : ''}{' '}
                          • {paiement.mode_paiement}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPaiement(paiement)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePaiement(String(paiement.id))}
                        className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};






