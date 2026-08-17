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

// NOVO: Define estritamente o que pode ser atualizado.
export interface UpdateShipmentData {
  status?: string;
  last_checked_at?: Date | null;
  next_check_at?: Date | null;
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

  async findPendingChecks(limit: number = 10): Promise<Shipment[]> {
    return (
      db<Shipment>("shipments")
        .where(function () {
          // Agrupando o OR para não conflitar com futuros WHEREs (ex: status != delivered)
          this.whereNull("next_check_at").orWhere(
            "next_check_at",
            "<=",
            new Date(),
          );
        })
        // Prioriza recém-criados primeiro (NULL) e depois os que estão há mais tempo esperando
        .orderByRaw("next_check_at ASC NULLS FIRST")
        .limit(limit)
    );
  },

  // Substituímos o Partial<Shipment> por UpdateShipmentData
  async update(id: string, data: UpdateShipmentData): Promise<void> {
    await db("shipments")
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(), // Gerenciado internamente pelo repositório
      });
  },
};
