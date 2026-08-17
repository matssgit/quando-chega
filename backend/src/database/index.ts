import { env } from "../config/env"; // Usando nossa central
import knex from "knex";

export const db = knex({
  client: "pg",
  connection: env.DATABASE_URL, // Sempre será uma string garantida pelo Zod
  pool: {
    min: 2,
    max: 10,
  },
});
