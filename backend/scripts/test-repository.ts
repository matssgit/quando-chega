import { ShipmentRepository } from "../src/database/repositories/shipment-repository";
import { db } from "../src/database";

async function testRepo() {
  try {
    console.log("[Quando Chega?] Testando ShipmentRepository...");

    const mockTracking = `BR${Date.now()}BR`;

    console.log(`Inserindo encomenda fictícia: ${mockTracking}`);
    const newShipment = await ShipmentRepository.create({
      tracking_code: mockTracking,
      provider: "correios",
    });
    console.log("✅ Encomenda criada no banco! ID:", newShipment.id);

    console.log("Buscando encomenda no banco...");
    const foundShipment =
      await ShipmentRepository.findByTrackingCode(mockTracking);

    if (foundShipment) {
      console.log("✅ Encomenda encontrada com sucesso:");
      console.log(`   -> Código: ${foundShipment.tracking_code}`);
      console.log(`   -> Status: ${foundShipment.status}`);
      console.log(`   -> Criado em: ${foundShipment.created_at}`);
    }
  } catch (error) {
    console.error("❌ Erro no teste do repositório:", error);
  } finally {
    await db.destroy();
  }
}

testRepo();
