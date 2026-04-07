import type { InsuranceProvider, ProviderConfig } from './provider.interface';
import { AskiaProvider } from './providers/askia.provider';

const providerRegistry: Record<
  string,
  new (config: ProviderConfig) => InsuranceProvider
> = {
  askia: AskiaProvider,
};

export function getProvider(config: ProviderConfig): InsuranceProvider {
  const ProviderClass = providerRegistry[config.provider];
  if (!ProviderClass) {
    throw new Error(
      `Provider inconnu: "${config.provider}". Disponibles: ${Object.keys(providerRegistry).join(', ')}`,
    );
  }
  return new ProviderClass(config);
}

export function isProviderConfigured(
  apiConfig: unknown,
): apiConfig is ProviderConfig {
  return (
    typeof apiConfig === 'object' &&
    apiConfig !== null &&
    typeof (apiConfig as ProviderConfig).provider === 'string' &&
    typeof (apiConfig as ProviderConfig).base_url === 'string'
  );
}
