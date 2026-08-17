import "dotenv/config"; // Carrega as variáveis do .env com segurança

const TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const TRACKING_CODE = process.env.TEST_TRACKING_CODE;
const API_URL = "https://www.melhorenvio.com.br/api/v2/me/shipment/tracking";

async function runPoC() {
  if (!TOKEN || !TRACKING_CODE) {
    console.log(
      "⚠️ ERRO: Faltam as variáveis MELHOR_ENVIO_TOKEN ou TEST_TRACKING_CODE no arquivo .env",
    );
    return;
  }

  console.log(
    `[PoC Melhor Envio] Consultando encomenda de teste: ${TRACKING_CODE}\n`,
  );

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        "User-Agent": "suporte_dev@quandochega.local", // Placeholder seguro
      },
      body: JSON.stringify({
        orders: [TRACKING_CODE],
      }),
    });

    const status = response.status;
    const contentType = response.headers.get("content-type") || "desconhecido";

    console.log(`Status HTTP: ${status}`);
    console.log(`Content-Type: ${contentType}\n`);

    const data = await response.json();

    if (status !== 200) {
      console.log(
        `❌ Erro retornado pela API:\n`,
        JSON.stringify(data, null, 2),
      );
      return;
    }

    const payload = data[TRACKING_CODE];

    if (!payload) {
      console.log(
        `⚠️ A resposta foi 200 OK, mas não há dados para o código ${TRACKING_CODE}. Resposta crua:\n`,
        JSON.stringify(data, null, 2),
      );
      return;
    }

    console.log(`✅ Resposta recebida para o código ${TRACKING_CODE}:\n`);

    // Verificando a estrutura crua para entendermos os campos disponíveis
    console.log(`Estrutura base do objeto da encomenda:`, Object.keys(payload));

    if (
      payload.tracking &&
      Array.isArray(payload.tracking) &&
      payload.tracking.length > 0
    ) {
      console.log(
        `\n📦 Eventos encontrados na timeline: ${payload.tracking.length}`,
      );

      // Imprimindo TODOS os eventos sem assumir ordenação
      payload.tracking.forEach((event: any, index: number) => {
        console.log(`\n[Evento ${index}]`);
        console.log(` - Data (Raw): ${event.date}`);
        console.log(` - Status: ${event.status}`);
        console.log(` - Localização (Raw):`, event.location);
        console.log(
          ` - Campos extras encontrados:`,
          Object.keys(event).filter(
            (k) => !["date", "status", "location"].includes(k),
          ),
        );
      });
    } else {
      console.log(
        `\n⚠️ Nenhum evento encontrado no array 'tracking'. Estrutura crua:\n`,
        JSON.stringify(payload, null, 2),
      );
    }
  } catch (error) {
    console.error("Erro de requisição:", error);
  }
}

runPoC();
