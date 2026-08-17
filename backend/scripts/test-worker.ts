import { ProviderFactory } from "../src/providers/provider-factory";
import { SyncShipmentService } from "../src/core/services/sync-shipment-service";
import { db } from "../src/database";

async function runEvolutionTest() {
  try {
    console.log("[Worker] Preparando o terreno para o teste de evolução...");
    await db("tracking_events").del();
    await db("shipments").update({ provider: "mock", status: "pending" });

    const shipment = await db("shipments").where({ provider: "mock" }).first();

    if (!shipment) {
      console.log("Nenhuma encomenda encontrada no banco.");
      return;
    }

    const provider = ProviderFactory.getProvider(shipment.provider);
    const syncService = new SyncShipmentService(provider);

    console.log(
      `[Worker] Iniciando a máquina do tempo para a encomenda: ${shipment.tracking_code}\n`,
    );

    // Simulando o Scheduler batendo na porta 6 vezes seguidas
    for (let i = 1; i <= 6; i++) {
      console.log(`\n================ SIMULAÇÃO #${i} ================`);
      const result = await syncService.execute(shipment.tracking_code);
      console.log(`[Resultado #${i}]:`, result);
    }
  } catch (error) {
    console.error("Erro no worker:", error);
  } finally {
    await db.destroy();
  }
}

runEvolutionTest();
