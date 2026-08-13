import { MockProvider } from "../../providers/mock-provider";
import { ShipmentRepository } from "../../database/repositories/shipment-repository";
import { TrackingEventRepository } from "../../database/repositories/tracking-event-repository";
import { generateEventHash } from "../../utils/hash";

export const SyncShipmentService = {
  async execute(trackingCode: string) {
    console.log(`[SyncService] Iniciando sincronização para: ${trackingCode}`);

    // 1. Busca a encomenda no banco
    const shipment = await ShipmentRepository.findByTrackingCode(trackingCode);
    if (!shipment) {
      throw new Error(`Encomenda não encontrada: ${trackingCode}`);
    }

    // 2. Consulta a transportadora
    const events = await MockProvider.track(trackingCode);

    let hasNewEvents = false;
    let latestStatus = shipment.status;

    // 3. Processa cada evento retornado
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

      // Se retornou o objeto, é porque foi inserido no banco (não existia)
      if (savedEvent) {
        hasNewEvents = true;
        // Assume que o evento processado possui o status mais recente
        latestStatus = event.status;
      }
    }

    const nextCheck = new Date(Date.now() + 1 * 60 * 1000);

    // 4. Atualiza os dados principais da encomenda na tabela shipments
    await ShipmentRepository.update(shipment.id, {
      status: hasNewEvents ? latestStatus : shipment.status,
      last_checked_at: new Date(),
      next_check_at: nextCheck, // Adicionamos esta linha
    });

    console.log(
      `[SyncService] Sincronização finalizada. Próxima checagem em: ${nextCheck.toLocaleTimeString()}`,
    );

    return {
      success: true,
      newEventsInserted: hasNewEvents,
      currentStatus: hasNewEvents ? latestStatus : shipment.status,
    };
  },
};
