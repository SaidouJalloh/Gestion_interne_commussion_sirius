import { prisma } from '../../core/prisma';
import { getProvider, isProviderConfigured } from './provider.factory';
import type {
  ProviderConfig,
  SimulationParams,
  SimulationResult,
  ReferentielParams,
} from './provider.interface';

export class InsuranceProviderService {
  async simulate(
    compagnieId: string,
    organizationId: string,
    params: SimulationParams,
  ): Promise<SimulationResult> {
    const { provider } = await this.resolveProvider(compagnieId, organizationId);
    return provider.simulate(params);
  }

  async getReferentiel(
    compagnieId: string,
    organizationId: string,
    params: ReferentielParams,
  ): Promise<unknown[]> {
    const { provider } = await this.resolveProvider(compagnieId, organizationId);
    return provider.getReferentiel(params);
  }

  async getProviderInfo(
    compagnieId: string,
    organizationId: string,
  ): Promise<{ provider: string; configured: true } | null> {
    const compagnie = await prisma.compagnies.findFirst({
      where: { id: compagnieId, organization_id: organizationId },
      select: { api_config: true },
    });

    if (!compagnie || !isProviderConfigured(compagnie.api_config)) {
      return null;
    }

    return {
      provider: (compagnie.api_config as ProviderConfig).provider,
      configured: true,
    };
  }

  private async resolveProvider(compagnieId: string, organizationId: string) {
    const compagnie = await prisma.compagnies.findFirst({
      where: { id: compagnieId, organization_id: organizationId },
      select: { id: true, api_config: true },
    });

    if (!compagnie) {
      const err = new Error('Compagnie non trouvée') as Error & { status?: number };
      err.status = 404;
      throw err;
    }

    if (!isProviderConfigured(compagnie.api_config)) {
      const err = new Error(
        "Cette compagnie n'a pas de fournisseur API configuré",
      ) as Error & { status?: number };
      err.status = 400;
      throw err;
    }

    const provider = getProvider(compagnie.api_config as ProviderConfig);
    return { provider, compagnie };
  }
}
