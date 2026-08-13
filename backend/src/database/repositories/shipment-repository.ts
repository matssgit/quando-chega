import { db } from "../index";

export interface Shipment {
  id: string;
  tracking_code: string;
  provider: string;
  status: string;
  last_checked_at: Date | null;
  next_check_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const ShipmentRepository = {
  async create(data: {
    tracking_code: string;
    provider: string;
  }): Promise<Shipment> {
    const [shipment] = await db<Shipment>("shipments")
      .insert({
        tracking_code: data.tracking_code,
        provider: data.provider,
        status: "pending",
      })
      .returning("*");
    return shipment;
  },

  async findByTrackingCode(
    tracking_code: string,
  ): Promise<Shipment | undefined> {
    return db<Shipment>("shipments").where({ tracking_code }).first();
  },

  async update(id: string, data: Partial<Shipment>): Promise<void> {
    await db("shipments")
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(), // Garante que a data de modificação seja atualizada
      });
  },

  async findPendingChecks(limit: number = 10): Promise<Shipment[]> {
    return db<Shipment>("shipments")
      .whereNull("next_check_at")
      .orWhere("next_check_at", "<=", new Date())
      .limit(limit);
  },
};
