import { FastifyInstance } from "fastify";
import { ShipmentRepository } from "../../database/repositories/shipment-repository";
import { z } from "zod";

export async function shipmentRoutes(app: FastifyInstance) {
  app.post("/shipments", async (request, reply) => {
    // 1. Define o esquema de validação dos dados esperados
    const createShipmentSchema = z.object({
      tracking_code: z.string().min(5, "Código de rastreio muito curto"),
      provider: z.string().min(2, "Provedor inválido"),
    });

    try {
      // 2. Valida os dados (Se falhar, o Zod lança um erro e cai no catch)
      const { tracking_code, provider } = createShipmentSchema.parse(
        request.body,
      );

      // 3. Verifica se a encomenda já existe
      const existingShipment =
        await ShipmentRepository.findByTrackingCode(tracking_code);

      if (existingShipment) {
        return reply
          .status(409)
          .send({ error: "Código de rastreamento já cadastrado" });
      }

      // 4. Salva no banco de dados
      const shipment = await ShipmentRepository.create({
        tracking_code,
        provider,
      });

      // 5. Retorna sucesso (201 Created)
      return reply.status(201).send({ shipment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply
          .status(400)
          .send({ error: "Dados inválidos", details: error.format() });
      }

      app.log.error(error);
      return reply.status(500).send({ error: "Erro interno no servidor" });
    }
  });
}
