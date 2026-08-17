import { env } from "./config/env"; // 1. Importamos nossa fonte única de verdade
import fastify from "fastify";
import { shipmentRoutes } from "./http/routes/shipment-routes";
import { startScheduler } from "./jobs/scheduler";

const app = fastify({ logger: true });

app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

app.register(shipmentRoutes);

const start = async () => {
  try {
    // 2. Removemos o parseInt manual. O Zod já garantiu que env.PORT é um número.
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log(`[Quando Chega?] Servidor HTTP rodando na porta ${env.PORT}`);

    // Inicia o job em background!
    startScheduler();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
