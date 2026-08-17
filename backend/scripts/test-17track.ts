import "dotenv/config";

// 1. Leitura das variáveis (ignorando o CARRIER_ID desta vez)
const API_KEY = process.env.TRACK17_API_KEY;
const TRACKING_CODE = process.env.TEST_TRACKING_CODE;

// 2. Endpoints da documentação atual V2.4
const REGISTER_URL = "https://api.17track.net/track/v2.4/register";
const GET_TRACK_INFO_URL = "https://api.17track.net/track/v2.4/gettrackinfo";

async function runPoC() {
  if (!API_KEY || !TRACKING_CODE) {
    console.error(
      "⚠️ ERRO: Configure TRACK17_API_KEY e TEST_TRACKING_CODE no .env",
    );
    return;
  }

  const headers = {
    "17token": API_KEY,
    "Content-Type": "application/json",
  };

  // 3. Request APENAS com o número, forçando o Auto-Detect do 17TRACK
  const payload = JSON.stringify([
    {
      number: TRACKING_CODE,
    },
  ]);

  try {
    console.log(
      `[1/2] Registrando código: ${TRACKING_CODE} via Auto-Detect...`,
    );

    const registerResponse = await fetch(REGISTER_URL, {
      method: "POST",
      headers,
      body: payload,
    });

    console.log(`\n--- RESPOSTA: REGISTRO (V2.4 - Auto-Detect) ---`);
    console.log(`Status HTTP: ${registerResponse.status}`);
    const registerData = await registerResponse.json();
    console.log(`JSON Bruto:\n`, JSON.stringify(registerData, null, 2));

    if (registerData.code !== 0) {
      console.log(
        `\n⚠️ A API retornou HTTP 200, mas o código de registro geral não é 0 (sucesso). Verifique o JSON.`,
      );
    }

    console.log(
      `\n[Aguardando 3 segundos para propagação do registro no 17TRACK...]`,
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log(`\n[2/2] Consultando informações de rastreamento...`);
    const trackResponse = await fetch(GET_TRACK_INFO_URL, {
      method: "POST",
      headers,
      body: payload,
    });

    console.log(`\n--- RESPOSTA: CONSULTA (V2.4) ---`);
    console.log(`Status HTTP: ${trackResponse.status}`);
    const trackData = await trackResponse.json();
    console.log(`JSON Bruto Completo:\n`, JSON.stringify(trackData, null, 2));
  } catch (error) {
    console.error("❌ Erro inesperado na requisição:", error);
  }
}

runPoC();
