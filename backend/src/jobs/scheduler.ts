import { ShipmentRepository } from "../database/repositories/shipment-repository";
import { SyncShipmentService } from "../core/services/sync-shipment-services";

export function startScheduler() {
  console.log(
    "[Scheduler] Job em background iniciado. Verificando a cada 30 segundos.",
  );

  // Executa o bloco a cada 30 segundos
  setInterval(async () => {
    try {
      const pendingShipments = await ShipmentRepository.findPendingChecks(5); // Pega de 5 em 5

      if (pendingShipments.length === 0) {
        // Silenciado para não poluir o terminal, mas significa que não há nada para verificar agora
        return;
      }

      console.log(
        `\n[Scheduler] Encontradas ${pendingShipments.length} encomendas para verificar.`,
      );

      // Sincroniza cada encomenda pendente
      for (const shipment of pendingShipments) {
        await SyncShipmentService.execute(shipment.tracking_code);
      }
    } catch (error) {
      console.error("[Scheduler] Erro na execução do job:", error);
    }
  }, 30 * 1000); // 30 segundos
}
