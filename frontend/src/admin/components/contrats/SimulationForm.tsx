import { useState, useEffect, useCallback } from 'react';
import { Calculator, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import {
  useInsuranceProvider,
  type SimulationType,
  type SimulationResult,
} from '../../hooks/useInsuranceProvider';

type ReferentielItem = { code: string; libelle: string; [key: string]: unknown };

interface SimulationFormProps {
  compagnieId: string;
  typeContrat: string;
  onSimulationResult: (result: SimulationResult) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────

function mapTypeContratToSimulationType(
  typeContrat: string,
): SimulationType | null {
  const upper = typeContrat.toUpperCase();
  if (upper === 'AUTOMOBILE') return 'AUTOMOBILE';
  if (upper === 'VOYAGE') return 'VOYAGE';
  if (upper === 'MRH') return 'MRH';
  if (upper === 'RAPATRIEMENT') return 'RAPATRIEMENT';
  // Fallback for legacy types from taux_commissions
  if (upper.includes('AUTO') || upper.includes('FLOTTE') || upper.includes('MOTO'))
    return 'AUTOMOBILE';
  if (upper.includes('HABITATION')) return 'MRH';
  if (upper.includes('VOYAGE')) return 'VOYAGE';
  if (upper.includes('RAPATRIEMENT')) return 'RAPATRIEMENT';
  return null;
}

// ─── Component ──────────────────────────────────────────────────────

export function SimulationForm({
  compagnieId,
  typeContrat,
  onSimulationResult,
}: SimulationFormProps) {
  const { loading, error, simulate, fetchReferentiel } =
    useInsuranceProvider();

  const [result, setResult] = useState<SimulationResult | null>(null);

  // Referentiel data
  const [categories, setCategories] = useState<ReferentielItem[]>([]);
  const [sousCategories, setSousCategories] = useState<ReferentielItem[]>([]);
  const [packs, setPacks] = useState<ReferentielItem[]>([]);

  // Simulation form state
  const [mode, setMode] = useState<'normal' | 'pack'>('normal');
  const [autoParams, setAutoParams] = useState({
    categorie: '',
    sous_categorie: '000',
    energie: 'E00001',
    puissance_fiscale: '',
    nombre_places: '5',
    duree: '12',
    valeur_a_neuf: '',
    valeur_venale: '0',
    recours: false,
    vol: false,
    incendie: false,
    personnes_transportees: false,
    bris_glaces: false,
    pack_code: '',
  });

  const [voyageParams, setVoyageParams] = useState({
    zone: '001',
    duree: '',
  });

  const [mrhParams, setMrhParams] = useState({
    contenu: '',
    nombre_pieces: '',
    duree: '12',
  });

  const [rapatriementParams, setRapatriementParams] = useState({
    formule: '01',
    adultes_supplementaires: '0',
    enfants_supplementaires: '0',
    nombre_ages: '0',
  });

  const simType = mapTypeContratToSimulationType(typeContrat);

  // Load referentiel data for AUTOMOBILE
  useEffect(() => {
    if (!compagnieId || simType !== 'AUTOMOBILE') return;
    fetchReferentiel(compagnieId, 'categories', { brCode: '500' }).then(
      (cats) => {
        setCategories(cats);
        if (cats.length > 0 && !autoParams.categorie) {
          setAutoParams((p) => ({ ...p, categorie: cats[0].code }));
        }
      },
    );
    fetchReferentiel(compagnieId, 'packs').then(setPacks);
  }, [compagnieId, simType, fetchReferentiel]);

  // Load sous-categories when category changes
  useEffect(() => {
    if (!compagnieId || simType !== 'AUTOMOBILE' || !autoParams.categorie) {
      setSousCategories([]);
      return;
    }
    fetchReferentiel(compagnieId, 'sous_categories', { catCode: autoParams.categorie })
      .then((scats) => {
        setSousCategories(scats);
        setAutoParams((p) => ({ ...p, sous_categorie: scats.length > 0 ? scats[0].code : '000' }));
      });
  }, [compagnieId, simType, autoParams.categorie, fetchReferentiel]);

  // Reset result when params change
  useEffect(() => {
    setResult(null);
  }, [typeContrat, mode]);

  const handleSimulate = useCallback(async () => {
    if (!simType) return;

    let params: Record<string, unknown> = {};

    if (simType === 'AUTOMOBILE' && mode === 'pack') {
      params = {
        energie: autoParams.energie,
        puissance_fiscale: Number(autoParams.puissance_fiscale),
        nombre_places: Number(autoParams.nombre_places),
        duree: Number(autoParams.duree),
        valeur_a_neuf: Number(autoParams.valeur_a_neuf),
        pack_code: autoParams.pack_code,
      };
      const res = await simulate(compagnieId, 'AUTOMOBILE_PACK', params);
      if (res) setResult(res);
      return;
    }

    if (simType === 'AUTOMOBILE') {
      params = {
        categorie: autoParams.categorie,
        sous_categorie: autoParams.sous_categorie,
        energie: autoParams.energie,
        puissance_fiscale: Number(autoParams.puissance_fiscale),
        nombre_places: Number(autoParams.nombre_places),
        duree: Number(autoParams.duree),
        valeur_a_neuf: Number(autoParams.valeur_a_neuf),
        valeur_venale: Number(autoParams.valeur_venale || 0),
        recours: autoParams.recours ? 1 : 0,
        vol: autoParams.vol ? 1 : 0,
        incendie: autoParams.incendie ? 1 : 0,
        personnes_transportees: autoParams.personnes_transportees ? 1 : 0,
        bris_glaces: autoParams.bris_glaces ? 1 : 0,
      };
    } else if (simType === 'VOYAGE') {
      params = {
        zone: voyageParams.zone,
        duree: Number(voyageParams.duree),
      };
    } else if (simType === 'MRH') {
      params = {
        contenu: Number(mrhParams.contenu),
        nombre_pieces: Number(mrhParams.nombre_pieces),
        duree: Number(mrhParams.duree),
      };
    } else if (simType === 'RAPATRIEMENT') {
      params = {
        formule: rapatriementParams.formule,
        adultes_supplementaires: Number(rapatriementParams.adultes_supplementaires),
        enfants_supplementaires: Number(rapatriementParams.enfants_supplementaires),
        nombre_ages: Number(rapatriementParams.nombre_ages),
      };
    }

    const res = await simulate(compagnieId, simType, params);
    if (res) setResult(res);
  }, [
    simType,
    mode,
    autoParams,
    voyageParams,
    mrhParams,
    rapatriementParams,
    compagnieId,
    simulate,
  ]);

  if (!simType) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm">
        <AlertCircle className="w-4 h-4 inline mr-2" />
        La simulation n&apos;est pas disponible pour ce type de contrat.
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';
  const labelClass = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Simulation de tarif &mdash; {typeContrat}
        </h4>

        {/* ─── AUTOMOBILE ─────────────────────────────── */}
        {simType === 'AUTOMOBILE' && (
          <div className="space-y-3">
            {/* Mode toggle: Pack / Normal */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('pack')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  mode === 'pack'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                Tarif Pack
              </button>
              <button
                type="button"
                onClick={() => setMode('normal')}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  mode === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-300'
                }`}
              >
                Tarif Normal
              </button>
            </div>

            {/* ── Pack mode ── */}
            {mode === 'pack' && (
              <div>
                <label className={labelClass}>Pack commercial</label>
                <select
                  className={inputClass}
                  value={autoParams.pack_code}
                  onChange={(e) =>
                    setAutoParams((p) => ({ ...p, pack_code: e.target.value }))
                  }
                >
                  <option value="">-- Choisir un pack --</option>
                  {packs.map((pk) => (
                    <option key={pk.code} value={pk.code}>
                      {pk.libelle}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* ── Normal mode: Categorie → Sous-categorie ── */}
            {mode === 'normal' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Categorie</label>
                    <select
                      className={inputClass}
                      value={autoParams.categorie}
                      onChange={(e) =>
                        setAutoParams((p) => ({ ...p, categorie: e.target.value, sous_categorie: '000' }))
                      }
                    >
                      <option value="">-- Choisir --</option>
                      {categories.map((cat) => (
                        <option key={cat.code} value={cat.code}>
                          {cat.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Sous-categorie</label>
                    <select
                      className={inputClass}
                      value={autoParams.sous_categorie}
                      onChange={(e) =>
                        setAutoParams((p) => ({ ...p, sous_categorie: e.target.value }))
                      }
                      disabled={sousCategories.length === 0}
                    >
                      <option value="000">Aucune</option>
                      {sousCategories.map((sc) => (
                        <option key={sc.code} value={sc.code}>
                          {sc.libelle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Valeur venale (obligatoire pour vol/incendie)</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="Valeur actuelle du vehicule"
                    value={autoParams.valeur_venale}
                    onChange={(e) =>
                      setAutoParams((p) => ({ ...p, valeur_venale: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {/* ── Common auto fields ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Energie</label>
                <select
                  className={inputClass}
                  value={autoParams.energie}
                  onChange={(e) =>
                    setAutoParams((p) => ({ ...p, energie: e.target.value }))
                  }
                >
                  <option value="E00001">Essence</option>
                  <option value="E00002">Diesel</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Puissance fiscale</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Ex: 8"
                  value={autoParams.puissance_fiscale}
                  onChange={(e) =>
                    setAutoParams((p) => ({ ...p, puissance_fiscale: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Nombre de places</label>
                <input
                  type="number"
                  className={inputClass}
                  value={autoParams.nombre_places}
                  onChange={(e) =>
                    setAutoParams((p) => ({ ...p, nombre_places: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Duree (mois)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={autoParams.duree}
                  onChange={(e) =>
                    setAutoParams((p) => ({ ...p, duree: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Valeur a neuf</label>
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Ex: 10000000"
                  value={autoParams.valeur_a_neuf}
                  onChange={(e) =>
                    setAutoParams((p) => ({ ...p, valeur_a_neuf: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Garanties optionnelles (normal mode only) */}
            {mode === 'normal' && (
              <div>
                <label className={labelClass}>Garanties optionnelles</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {[
                    { key: 'recours', label: 'Recours' },
                    { key: 'vol', label: 'Vol' },
                    { key: 'incendie', label: 'Incendie' },
                    { key: 'personnes_transportees', label: 'Pers. transportees' },
                    { key: 'bris_glaces', label: 'Bris de glace' },
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center gap-1.5 text-xs text-slate-600"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={(autoParams as any)[key]}
                        onChange={(e) =>
                          setAutoParams((p) => ({ ...p, [key]: e.target.checked }))
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── VOYAGE ─────────────────────────────────── */}
        {simType === 'VOYAGE' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Zone de destination</label>
              <select
                className={inputClass}
                value={voyageParams.zone}
                onChange={(e) =>
                  setVoyageParams((p) => ({ ...p, zone: e.target.value }))
                }
              >
                <option value="001">Zone 1 - Afrique</option>
                <option value="002">Zone 2 - Europe</option>
                <option value="003">Zone 3 - Amerique/Asie</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Duree (jours)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="Ex: 15"
                value={voyageParams.duree}
                onChange={(e) =>
                  setVoyageParams((p) => ({ ...p, duree: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        {/* ─── MRH ────────────────────────────────────── */}
        {simType === 'MRH' && (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Valeur du contenu</label>
              <input
                type="number"
                className={inputClass}
                placeholder="Ex: 6000000"
                value={mrhParams.contenu}
                onChange={(e) =>
                  setMrhParams((p) => ({ ...p, contenu: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Nombre de pieces</label>
              <input
                type="number"
                className={inputClass}
                placeholder="Ex: 8"
                value={mrhParams.nombre_pieces}
                onChange={(e) =>
                  setMrhParams((p) => ({ ...p, nombre_pieces: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Duree (mois)</label>
              <input
                type="number"
                className={inputClass}
                value={mrhParams.duree}
                onChange={(e) =>
                  setMrhParams((p) => ({ ...p, duree: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        {/* ─── RAPATRIEMENT ───────────────────────────── */}
        {simType === 'RAPATRIEMENT' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Formule</label>
              <select
                className={inputClass}
                value={rapatriementParams.formule}
                onChange={(e) =>
                  setRapatriementParams((p) => ({ ...p, formule: e.target.value }))
                }
              >
                <option value="01">Individuel</option>
                <option value="02">Famille (2 adultes + 3 enfants)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Adultes supplementaires</label>
              <input
                type="number"
                className={inputClass}
                value={rapatriementParams.adultes_supplementaires}
                onChange={(e) =>
                  setRapatriementParams((p) => ({ ...p, adultes_supplementaires: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Enfants supplementaires</label>
              <input
                type="number"
                className={inputClass}
                value={rapatriementParams.enfants_supplementaires}
                onChange={(e) =>
                  setRapatriementParams((p) => ({ ...p, enfants_supplementaires: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Personnes 80+ ans</label>
              <input
                type="number"
                className={inputClass}
                value={rapatriementParams.nombre_ages}
                onChange={(e) =>
                  setRapatriementParams((p) => ({ ...p, nombre_ages: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        {/* ─── Simulate button ────────────────────────── */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleSimulate}
            disabled={loading}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Simulation en cours...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Simuler le tarif
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ─── Result card ──────────────────────────────── */}
      {result && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Resultat de la simulation
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <ResultItem label="Prime nette" value={result.prime_nette} />
            <ResultItem label="Accessoire" value={result.accessoire} />
            <ResultItem label="FGA" value={result.fga} />
            <ResultItem label="Taxes" value={result.taxe} />
            <ResultItem label="Commission" value={result.commission} />
            <ResultItem
              label="Prime TTC"
              value={result.prime_ttc}
              highlight
            />
          </div>

          <button
            type="button"
            onClick={() => onSimulationResult(result)}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Utiliser ces valeurs
          </button>
        </div>
      )}
    </div>
  );
}

function ResultItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-2 ${
        highlight ? 'bg-emerald-100' : 'bg-white'
      }`}
    >
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className={`text-sm font-mono font-semibold ${
          highlight ? 'text-emerald-800' : 'text-slate-800'
        }`}
      >
        {value.toLocaleString('fr-FR')} FCFA
      </div>
    </div>
  );
}
