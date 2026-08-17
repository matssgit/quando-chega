import {
  TrackingEventData,
  TrackingProvider,
} from "./contracts/tracking-provider";

export class MockProvider implements TrackingProvider {
  // Estado em memória para simular a evolução temporal das encomendas
  private queryCounts = new Map<string, number>();

  async track(trackingCode: string): Promise<TrackingEventData[]> {
    // Incrementa o contador de consultas para este código
    const currentQuery = (this.queryCounts.get(trackingCode) || 0) + 1;
    this.queryCounts.set(trackingCode, currentQuery);

    console.log(
      `\n[MockProvider] 📦 Rastreando ${trackingCode} | Consulta simulada #${currentQuery}`,
    );

    // As datas precisam ser estáticas (fixas) para que o gerador de Hash
    // produza sempre o mesmo ID para o mesmo evento, garantindo a deduplicação.
    const baseTime = new Date("2026-08-15T10:00:00.000Z").getTime();

    // Timeline completa da nossa encomenda
    const fullTimeline: TrackingEventData[] = [
      {
        status: "Postado",
        description: "Objeto postado",
        location: "Agência - São Paulo/SP",
        occurred_at: new Date(baseTime),
      },
      {
        status: "Encaminhado",
        description: "Objeto encaminhado para Unidade de Tratamento",
        location: "São Paulo/SP",
        occurred_at: new Date(baseTime + 1000 * 60 * 60 * 24), // +1 dia
      },
      {
        status: "Em trânsito",
        description: "Objeto em trânsito para Unidade de Distribuição",
        location: "Guarujá/SP",
        occurred_at: new Date(baseTime + 1000 * 60 * 60 * 48), // +2 dias
      },
      {
        status: "Saiu para entrega",
        description: "Objeto saiu para entrega ao destinatário",
        location: "Guarujá/SP",
        occurred_at: new Date(baseTime + 1000 * 60 * 60 * 55), // +2 dias, 7 horas
      },
      {
        status: "Entregue",
        description: "Objeto entregue ao destinatário",
        location: "Guarujá/SP",
        occurred_at: new Date(baseTime + 1000 * 60 * 60 * 60), // +2 dias, 12 horas
      },
    ];

    // Retorna uma fatia do array baseada em quantas vezes já consultamos
    // Se passou de 5 consultas, continua retornando os 5 eventos (simulando que parou de atualizar)
    const eventsToReturn = fullTimeline.slice(0, currentQuery);

    return eventsToReturn;
  }
}
