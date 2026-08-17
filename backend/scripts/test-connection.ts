import "dotenv/config";

import knex from "knex";
import knexConfig from "../knexfile";

const db = knex(knexConfig.development);

async function testConnection() {
  try {
    console.log("[Quando Chega?] Testando conexão com o PostgreSQL...");
    const result = await db.raw("SELECT 1 as result");
    console.log("✅ Conexão bem-sucedida! Retorno do banco:", result.rows[0]);
  } catch (error) {
    console.error("❌ Erro ao conectar no banco de dados:", error);
  } finally {
    await db.destroy();
  }
}

testConnection();
