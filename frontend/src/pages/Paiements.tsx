import { useMemo, useState } from 'react';
import { usePaymentsData } from '../hooks/usePaymentsData';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(amount) + ' FCFA';

export default function Paiements() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('all');

  const { payments, loading, refetch } = usePaymentsData({
    from: from || undefined,
    to: to || undefined,
    type: type === 'all' ? undefined : type,
  });

  const stats = useMemo(() => {
    const commissionsRecues = payments
      .filter((p) => p.type_paiement === 'commission_compagnie')
      .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);

    const primesEncaissees = payments
      .filter((p) => p.type_paiement === 'client_prime')
      .reduce((sum, p) => sum + parseFloat(p.montant || 0), 0);

    return { commissionsRecues, primesEncaissees };
  }, [payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paiements</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Suivi des paiements (API backend)
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Rafraîchir
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Du
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Au
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">Tous</option>
              <option value="client_prime">Prime client</option>
              <option value="commission_compagnie">Commission</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={refetch}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Commissions reçues</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(stats.commissionsRecues)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Primes encaissées</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(stats.primesEncaissees)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 dark:text-white">
            Historique ({payments.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  Contrat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {p.date_paiement
                      ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {p.type_paiement === 'client_prime' ? 'Prime client' : 'Commission'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(parseFloat(p.montant || 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {p.contrats?.clients
                      ? `${p.contrats.clients.nom || ''} ${p.contrats.clients.prenom || ''}`.trim()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {p.contrats?.type_contrat ? p.contrats.type_contrat : '-'}
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={5}>
                    Aucun paiement
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}