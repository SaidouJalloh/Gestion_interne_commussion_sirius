// ─── Simulation Parameters ─────────────────────────────────────────────

export interface AutoSimulationParams {
  categorie: string;
  sous_categorie?: string;
  energie: string;
  puissance_fiscale: number;
  nombre_places: number;
  duree: number;
  valeur_a_neuf: number;
  valeur_venale?: number;
  recours?: number;
  vol?: number;
  incendie?: number;
  personnes_transportees?: number;
  bris_glaces?: number;
}

export interface AutoPackSimulationParams {
  energie: string;
  puissance_fiscale: number;
  nombre_places: number;
  duree: number;
  valeur_a_neuf: number;
  pack_code: string;
}

export interface VoyageSimulationParams {
  zone: string;
  duree: number;
}

export interface MrhSimulationParams {
  contenu: number;
  nombre_pieces: number;
  duree: number;
}

export interface RapatriementSimulationParams {
  formule: string;
  adultes_supplementaires: number;
  enfants_supplementaires: number;
  nombre_ages?: number;
}

export type SimulationParams =
  | { type: 'AUTOMOBILE'; params: AutoSimulationParams }
  | { type: 'AUTOMOBILE_PACK'; params: AutoPackSimulationParams }
  | { type: 'VOYAGE'; params: VoyageSimulationParams }
  | { type: 'MRH'; params: MrhSimulationParams }
  | { type: 'RAPATRIEMENT'; params: RapatriementSimulationParams };

export type SimulationType = SimulationParams['type'];

// ─── Simulation Result ─────────────────────────────────────────────────

export interface SimulationResult {
  id_saisie: string;
  prime_nette: number;
  accessoire: number;
  fga: number;
  commission: number;
  taxe: number;
  prime_ttc: number;
  raw_response?: unknown;
}

// ─── Referentiel ───────────────────────────────────────────────────────

export type ReferentielType =
  | 'packs'
  | 'branches'
  | 'categories'
  | 'sous_categories'
  | 'marques'
  | 'pays'
  | 'type_piece'
  | 'carrosseries';

export interface ReferentielParams {
  type: ReferentielType;
  filters?: Record<string, string>;
}

// ─── Provider Interface ────────────────────────────────────────────────

export interface InsuranceProvider {
  readonly name: string;
  simulate(params: SimulationParams): Promise<SimulationResult>;
  getReferentiel(params: ReferentielParams): Promise<unknown[]>;
}

// ─── Provider Config (stored in compagnies.api_config) ─────────────────

export interface ProviderConfig {
  provider: string;
  base_url: string;
  [key: string]: unknown;
}
