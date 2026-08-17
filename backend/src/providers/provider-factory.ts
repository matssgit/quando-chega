import { MockProvider } from "./mock-provider";
import { TrackingProvider } from "./contracts/tracking-provider";

export const ProviderFactory = {
  getProvider(providerName: string): TrackingProvider {
    switch (providerName.toLowerCase().trim()) {
      case "mock":
        return new MockProvider();

      // Futuramente, adicionaremos os outros provedores reais aqui:
      // case 'correios':
      //   return new CorreiosProvider();

      default:
        throw new Error(
          `Provedor não suportado ou ainda não implementado: ${providerName}`,
        );
    }
  },
};
