import { SyncShipmentService } from "../core/services/sync-shipment-services";
import { db } from "../database";

async function runWorkerTest() {
  try {
    console.log("[Worker] Acordando para buscar atualizações...");

    // Pega a primeira encomenda do banco apenas para testar
    const shipment = await db("shipments").first();

    if (!shipment) {
      console.log("Nenhuma encomenda encontrada no banco.");
      return;
    }

    // Delega toda a complexidade para o nosso Core Service
    const result = await SyncShipmentService.execute(shipment.tracking_code);

    console.log("[Worker] Resultado da operação:", result);
  } catch (error) {
    console.error("Erro no worker:", error);
  } finally {
    await db.destroy();
  }
}

runWorkerTest();
