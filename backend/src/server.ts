import "dotenv/config";

import fastify from "fastify";
import { shipmentRoutes } from "./http/routes/shipment-routes";
import { startScheduler } from "./jobs/scheduler"; // Importando o agendador

const app = fastify({ logger: true });

app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

app.register(shipmentRoutes);

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;

    await app.listen({ port, host: "0.0.0.0" });
    console.log(`[Quando Chega?] Servidor HTTP rodando na porta ${port}`);

    // Inicia o job em background!
    startScheduler();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
