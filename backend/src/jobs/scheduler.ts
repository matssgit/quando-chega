import { ProviderFactory } from "../providers/provider-factory";
import { ShipmentRepository } from "../database/repositories/shipment-repository";
import { SyncShipmentService } from "../core/services/sync-shipment-service";

// NOVO: Trava em memória para evitar sobreposição de execuções
let isRunning = false;

export function startScheduler() {
  console.log(
    "[Scheduler] Job em background iniciado. Verificando a cada 30 segundos.",
  );

  setInterval(async () => {
    // Se o ciclo anterior ainda não terminou, abortamos este prematuramente
    if (isRunning) {
      console.log(
        "[Scheduler] Ciclo ignorado: a execução anterior ainda está em andamento.",
      );
      return;
    }

    isRunning = true; // Tranca a porta

    try {
      const pendingShipments = await ShipmentRepository.findPendingChecks(5);

      if (pendingShipments.length === 0) {
        return;
      }

      console.log(
        `\n[Scheduler] Encontradas ${pendingShipments.length} encomendas para verificar.`,
      );

      for (const shipment of pendingShipments) {
        try {
          const provider = ProviderFactory.getProvider(shipment.provider);
          const syncService = new SyncShipmentService(provider);

          await syncService.execute(shipment.tracking_code);
        } catch (err) {
          console.error(
            `[Scheduler] Erro ao processar encomenda ${shipment.tracking_code}:`,
            err,
          );
        }
      }
    } catch (error) {
      console.error("[Scheduler] Erro crítico na execução do job:", error);
    } finally {
      // Destranca a porta independentemente de sucesso ou falha
      isRunning = false;
    }
  }, 30 * 1000);
}
