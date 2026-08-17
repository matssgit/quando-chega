import { ShipmentRepository } from "../../database/repositories/shipment-repository";
import { TrackingEventRepository } from "../../database/repositories/tracking-event-repository";
import { TrackingProvider } from "../../providers/contracts/tracking-provider";
import { generateEventHash } from "../../utils/hash";

export class SyncShipmentService {
  constructor(private trackingProvider: TrackingProvider) {}

  async execute(trackingCode: string) {
    console.log(`[SyncService] Iniciando sincronização para: ${trackingCode}`);

    const shipment = await ShipmentRepository.findByTrackingCode(trackingCode);
    if (!shipment) {
      throw new Error(`Encomenda não encontrada: ${trackingCode}`);
    }

    const events = await this.trackingProvider.track(trackingCode);

    let hasNewEvents = false;

    // 1. Processa e salva os eventos (a ordem não importa para o hash/deduplicação)
    for (const event of events) {
      const hash = generateEventHash(
        shipment.id,
        event.status,
        event.description,
        event.location,
        event.occurred_at,
      );

      const savedEvent = await TrackingEventRepository.create({
        shipment_id: shipment.id,
        status: event.status,
        description: event.description,
        location: event.location,
        occurred_at: event.occurred_at,
        event_hash: hash,
      });

      if (savedEvent) {
        hasNewEvents = true;
      }
    }

    // 2. Determina o status real da encomenda baseado no tempo (occurred_at)
    let latestStatus = shipment.status;

    if (hasNewEvents && events.length > 0) {
      // Utilizamos o reduce para varrer e encontrar o maior occurred_at.
      // O operador ">=" garante que, em caso de eventos com exatamente o mesmo
      // timestamp, o último a ser listado pelo provider preserve a prioridade (stable).
      const mostRecentEvent = events.reduce((latest, current) => {
        return current.occurred_at >= latest.occurred_at ? current : latest;
      }, events[0]);

      latestStatus = mostRecentEvent.status;
    }

    const nextCheck = new Date(Date.now() + 1 * 60 * 1000);

    // 3. Atualiza os dados principais da encomenda
    await ShipmentRepository.update(shipment.id, {
      status: latestStatus,
      last_checked_at: new Date(),
      next_check_at: nextCheck,
    });

    console.log(
      `[SyncService] Sincronização finalizada. Próxima checagem em: ${nextCheck.toLocaleTimeString()}`,
    );

    return {
      success: true,
      newEventsInserted: hasNewEvents,
      currentStatus: latestStatus,
    };
  }
}
