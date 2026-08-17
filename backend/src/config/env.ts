import "dotenv/config"; // Garante o carregamento do .env local, se existir

import { z } from "zod";

// 1. Define o esquema rigoroso das nossas variáveis
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL deve ser uma URL de conexão válida." }),
});

// 2. Tenta validar o process.env contra o nosso esquema
const _env = envSchema.safeParse(process.env);

// 3. Fail Fast: Se falhar, derruba a aplicação antes mesmo de iniciar o servidor
if (!_env.success) {
  console.error("❌ Variáveis de ambiente inválidas:", _env.error.format());
  throw new Error("Configuração de ambiente inválida.");
}

// 4. Exporta as variáveis tipadas e validadas (Single Source of Truth)
export const env = _env.data;
