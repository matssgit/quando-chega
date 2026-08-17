import { db } from "../index";

// NOVO: Tipagem explícita para não dependermos de objetos soltos
export interface TrackingEventDataInsert {
  shipment_id: string;
  status: string;
  description: string;
  location: string | null;
  occurred_at: Date;
  event_hash: string;
}

export const TrackingEventRepository = {
  async create(data: TrackingEventDataInsert) {
    const [insertedEvent] = await db("tracking_events")
      .insert(data)
      .onConflict("event_hash")
      .ignore()
      .returning("*");

    return insertedEvent;
  },
};
