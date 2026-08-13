import { db } from "../index";

export const TrackingEventRepository = {
  async create(data: {
    shipment_id: string;
    status: string;
    description: string;
    location: string | null;
    occurred_at: Date;
    event_hash: string;
  }) {
    // Tenta inserir. Se o event_hash já existir, ele ignora silenciosamente e não quebra a aplicação.
    const [insertedEvent] = await db("tracking_events")
      .insert(data)
      .onConflict("event_hash")
      .ignore()
      .returning("*");

    return insertedEvent; // Retornará o objeto se inseriu, ou undefined se foi ignorado (duplicado)
  },
};
