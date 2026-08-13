import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("shipments", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("tracking_code").notNullable().unique();
    table.string("provider").notNullable();
    table.string("status").notNullable().defaultTo("pending");

    table.timestamp("last_checked_at", { useTz: true }).nullable();
    table.timestamp("next_check_at", { useTz: true }).nullable();

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table.index("next_check_at");
  });

  await knex.schema.createTable("tracking_events", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("shipment_id")
      .notNullable()
      .references("id")
      .inTable("shipments")
      .onDelete("CASCADE");

    table.string("status").notNullable();
    table.text("description").notNullable();
    table.string("location").nullable();
    table.timestamp("occurred_at", { useTz: true }).notNullable();

    table.string("event_hash").notNullable().unique();

    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("tracking_events");
  await knex.schema.dropTableIfExists("shipments");
}
