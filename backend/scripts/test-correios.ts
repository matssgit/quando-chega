const TRACKING_CODE = "NM987654321BR"; // Substitua por um código válido que você tenha, se possível

async function runPoC() {
  console.log(
    `[PoC Correios] Iniciando teste para o código: ${TRACKING_CODE}\n`,
  );

  // Vamos testar o endpoint mobile que a comunidade costumava usar (e que dizem estar bloqueado)
  const mobileEndpoint = `https://proxyapp.correios.com.br/v1/sro-rastro/${TRACKING_CODE}`;

  console.log(`1. Testando endpoint da API Mobile (App):`);
  console.log(`   URL: ${mobileEndpoint}`);

  try {
    const response = await fetch(mobileEndpoint, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/json",
      },
    });

    const status = response.status;
    const contentType = response.headers.get("content-type") || "desconhecido";

    console.log(`   Status HTTP: ${status}`);
    console.log(`   Content-Type: ${contentType}`);

    const textResult = await response.text();

    if (contentType.includes("application/json")) {
      console.log(`   Resposta (JSON):`, JSON.parse(textResult));
    } else {
      console.log(
        `   Resposta (Texto/HTML): \n${textResult.substring(0, 300)}... (truncado)`,
      );
    }
  } catch (err) {
    console.error("   Erro ao executar a requisição:", err);
  }

  console.log(
    "\n------------------------------------------------------------\n",
  );

  // Vamos testar o comportamento do Portal Web Público
  const webEndpoint = "https://rastreamento.correios.com.br/app/resultado.php";

  console.log(`2. Testando Rota do Portal Web Público:`);
  console.log(`   URL: ${webEndpoint}`);

  try {
    // Enviando requisição similar ao que o navegador faz ao buscar
    const formData = new URLSearchParams();
    formData.append("objeto", TRACKING_CODE);

    const responseWeb = await fetch(webEndpoint, {
      method: "POST",
      body: formData,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const statusWeb = responseWeb.status;
    const contentTypeWeb =
      responseWeb.headers.get("content-type") || "desconhecido";

    console.log(`   Status HTTP: ${statusWeb}`);
    console.log(`   Content-Type: ${contentTypeWeb}`);

    const textResultWeb = await responseWeb.text();

    if (contentTypeWeb.includes("application/json")) {
      console.log(`   Resposta (JSON):`, JSON.parse(textResultWeb));
    } else {
      console.log(
        `   Resposta (Texto/HTML contendo CAPTCHA/Bloqueio): \n${textResultWeb.substring(0, 300).trim()}... (truncado)`,
      );
    }
  } catch (err) {
    console.error("   Erro ao executar a requisição Web:", err);
  }

  console.log("\n[PoC Correios] Investigação finalizada.");
}

runPoC();
