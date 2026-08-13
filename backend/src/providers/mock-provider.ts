// No futuro, teremos CorreiosProvider, JadlogProvider, etc.
export const MockProvider = {
  async track(trackingCode: string) {
    console.log(
      `[MockProvider] Consultando site da transportadora para: ${trackingCode}...`,
    );

    // Simulando o retorno que o Python/Scraper nos dará no futuro
    return [
      {
        status: "in_transit",
        description: "Objeto encaminhado",
        location: "São Paulo/SP",
        occurred_at: new Date("2026-08-13T10:30:00.000Z"), // Data fixa para testarmos o hash
      },
    ];
  },
};
