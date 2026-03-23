import { useMemo, useState } from 'react';
import { RefreshCw, Filter, ArrowUpRight, ArrowDownLeft, Receipt, DollarSign } from 'lucide-react';
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
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historique des paiements</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Suivi des encaissements et reversements
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 font-bold border border-blue-100/50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <h2 className="font-bold text-slate-700">Filtres de recherche</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
              Du
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
              Au
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10"
            >
              <option value="all">Tous les types</option>
              <option value="client_prime">Prime client</option>
              <option value="commission_compagnie">Commission compagnie</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={refetch}
              className="w-full px-4 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-sm"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Commissions reçues</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatCurrency(stats.commissionsRecues)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Primes encaissées</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatCurrency(stats.primesEncaissees)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-800">
              Historique des transactions
              <span className="ml-2 px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs">
                {payments.length}
              </span>
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Montant
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Contrat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                    {p.date_paiement
                      ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.type_paiement === 'client_prime'
                          ? 'bg-purple-100/50 text-purple-700 border border-purple-200/50'
                          : 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50'
                      }`}
                    >
                      {p.type_paiement === 'client_prime' ? 'Prime client' : 'Commission'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-800 font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {formatCurrency(parseFloat(p.montant || 0))}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {p.contrats?.clients
                      ? `${p.contrats.clients.nom || ''} ${p.contrats.clients.prenom || ''}`.trim()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {p.contrats?.type_contrat ? (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                        {p.contrats.type_contrat}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={5}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                      <DollarSign className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Aucun paiement trouvé</p>
                    <p className="text-sm text-slate-400 mt-1">Modifiez vos filtres pour voir plus de résultats</p>
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