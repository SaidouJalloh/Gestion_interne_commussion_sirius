import type {
  InsuranceProvider,
  ProviderConfig,
  SimulationParams,
  SimulationResult,
  ReferentielParams,
  AutoSimulationParams,
  AutoPackSimulationParams,
  VoyageSimulationParams,
  MrhSimulationParams,
  RapatriementSimulationParams,
} from '../provider.interface';

interface AskiaConfig extends ProviderConfig {
  provider: 'askia';
  app_client: string;
  pv_code: string;
}

export class AskiaProvider implements InsuranceProvider {
  readonly name = 'askia';
  private readonly baseUrl: string;
  private readonly appClient: string;
  private readonly pvCode: string;

  constructor(config: ProviderConfig) {
    const c = config as AskiaConfig;
    this.baseUrl = c.base_url.replace(/\/+$/, '');
    this.appClient = c.app_client;
    this.pvCode = c.pv_code;
  }

  // ─── HTTP helper ───────────────────────────────────────────────────

  private async request<T = unknown>(
    path: string,
    params: Record<string, string | number>,
  ): Promise<T> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      query.set(key, String(value));
    }

    const url = `${this.baseUrl}${path}?${query.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          appClient: this.appClient,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          `ASKIA API error ${response.status}: ${text || response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('ASKIA API timeout (15s)');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ─── Simulation ────────────────────────────────────────────────────

  async simulate(params: SimulationParams): Promise<SimulationResult> {
    switch (params.type) {
      case 'AUTOMOBILE':
        return this.simulateAuto(params.params);
      case 'AUTOMOBILE_PACK':
        return this.simulateAutoPack(params.params);
      case 'VOYAGE':
        return this.simulateVoyage(params.params);
      case 'MRH':
        return this.simulateMrh(params.params);
      case 'RAPATRIEMENT':
        return this.simulateRapatriement(params.params);
      default:
        throw new Error(`Type de simulation non supporté: ${(params as any).type}`);
    }
  }

  private async simulateAuto(
    p: AutoSimulationParams,
  ): Promise<SimulationResult> {
    const raw = await this.request<AskiaSimulationResponse>('/srwb/automobile', {
      cat: p.categorie,
      scatCode: p.sous_categorie ?? '000',
      nrg: p.energie,
      pfs: p.puissance_fiscale,
      nbP: p.nombre_places,
      dure: p.duree,
      vaf: p.valeur_a_neuf,
      vvn: p.valeur_venale ?? 0,
      recour: p.recours ?? 0,
      vol: p.vol ?? 0,
      inc: p.incendie ?? 0,
      pt: p.personnes_transportees ?? 0,
      gb: p.bris_glaces ?? 0,
    });
    return this.mapSimulationResponse(raw);
  }

  private async simulateAutoPack(
    p: AutoPackSimulationParams,
  ): Promise<SimulationResult> {
    const raw = await this.request<AskiaSimulationResponse>('/srwb/autopack', {
      nrg: p.energie,
      pfs: p.puissance_fiscale,
      nbP: p.nombre_places,
      dure: p.duree,
      vaf: p.valeur_a_neuf,
      pck: p.pack_code,
    });
    return this.mapSimulationResponse(raw);
  }

  private async simulateVoyage(
    p: VoyageSimulationParams,
  ): Promise<SimulationResult> {
    const raw = await this.request<AskiaSimulationResponse>('/srwb/voyage', {
      zn: p.zone,
      duree: p.duree,
    });
    return this.mapSimulationResponse(raw);
  }

  private async simulateMrh(
    p: MrhSimulationParams,
  ): Promise<SimulationResult> {
    const raw = await this.request<AskiaSimulationResponse>('/srwb/mrh', {
      cntn: p.contenu,
      nbreP: p.nombre_pieces,
      duree: p.duree,
    });
    return this.mapSimulationResponse(raw);
  }

  private async simulateRapatriement(
    p: RapatriementSimulationParams,
  ): Promise<SimulationResult> {
    const raw = await this.request<AskiaRapatriementResponse>('/srwb/rapatriement', {
      formule: p.formule,
      adultesupl: p.adultes_supplementaires,
      enfantsupl: p.enfants_supplementaires,
      nbreAges: p.nombre_ages ?? 0,
    });
    return {
      id_saisie: raw.idSaisie ?? '',
      prime_nette: raw.primenette ?? 0,
      accessoire: 0,
      fga: 0,
      commission: 0,
      taxe: raw.taxe ?? 0,
      prime_ttc: raw.primettc ?? 0,
      raw_response: raw,
    };
  }

  private mapSimulationResponse(raw: AskiaSimulationResponse): SimulationResult {
    return {
      id_saisie: raw.idSaisie ?? '',
      prime_nette: raw.primenette ?? 0,
      accessoire: raw.accessoire ?? 0,
      fga: raw.fga ?? 0,
      commission: raw.commission ?? 0,
      taxe: raw.taxe ?? 0,
      prime_ttc: raw.primettc ?? 0,
      raw_response: raw,
    };
  }

  // ─── Referentiel ───────────────────────────────────────────────────

  async getReferentiel(params: ReferentielParams): Promise<unknown[]> {
    const { path, queryParams } = this.mapReferentielParams(params);
    const result = await this.request<unknown>(path, queryParams);
    return Array.isArray(result) ? result : [result];
  }

  private mapReferentielParams(params: ReferentielParams): {
    path: string;
    queryParams: Record<string, string | number>;
  } {
    const filters = params.filters ?? {};

    switch (params.type) {
      case 'packs':
        return { path: '/referentiel/packs', queryParams: {} };
      case 'branches':
        return { path: '/referentiel/branchepv', queryParams: {} };
      case 'categories':
        return {
          path: '/referentiel/categories',
          queryParams: { brCode: filters.brCode ?? '500' },
        };
      case 'sous_categories':
        return {
          path: '/referentiel/scategories',
          queryParams: { catCode: filters.catCode ?? '' },
        };
      case 'marques':
        return { path: '/referentiel/marques', queryParams: {} };
      case 'pays':
        return { path: '/referentiel/pays', queryParams: {} };
      case 'type_piece':
        return { path: '/referentiel/typepiece', queryParams: {} };
      case 'carrosseries':
        return {
          path: '/referentiel/carrosseries',
          queryParams: { scatCode: filters.scatCode ?? '000' },
        };
      default:
        throw new Error(`Type de référentiel non supporté: ${params.type}`);
    }
  }
}

// ─── ASKIA Response Types ────────────────────────────────────────────

interface AskiaSimulationResponse {
  idSaisie?: string;
  primenette?: number;
  accessoire?: number;
  fga?: number;
  commission?: number;
  taxe?: number;
  primettc?: number;
}

interface AskiaRapatriementResponse {
  formule?: string;
  idSaisie?: string;
  primenette?: number;
  primettc?: number;
  taxe?: number;
}
