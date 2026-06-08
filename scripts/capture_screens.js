import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/usr/bin/google-chrome';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = '/home/lucaspedro81/Área de trabalho/Estudos_Pedro/01_Projetos_Principais/Projeto_Integrador/ZelaMapa/docs/relatorio_prints';

async function capture(name, email, password, role = null) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log(`Capturando ${name}...`);
  await page.goto(BASE_URL);

  if (role === 'cidadao') {
    console.log("Simulando fluxo de Cidadão...");
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const cidButton = buttons.find(b => b.textContent.includes('Cidadão') || b.textContent.includes('Quero colaborar'));
        if (cidButton) cidButton.click();
    });
  } else if (email && password) {
    console.log(`Realizando login para ${email}...`);
    // Faz o login diretamente via API para garantir o token
    const token = await page.evaluate(async (e, p) => {
        const formData = new URLSearchParams();
        formData.append('username', e);
        formData.append('password', p);
        try {
            const res = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });
            const data = await res.json();
            return data.access_token;
        } catch (err) {
            return null;
        }
    }, email, password);

    if (token) {
        console.log(`Token obtido, injetando e navegando...`);

        // O authStore do Zustand usa a chave 'zelamapa-auth'
        await page.evaluate((t, e, r) => {
            const authData = {
                state: {
                    token: t,
                    user: {
                        id: 1,
                        email: e,
                        nome: "Usuario Teste",
                        papel: r
                    },
                    isAuthenticated: true
                },
                version: 0
            };
            localStorage.setItem('zelamapa-auth', JSON.stringify(authData));
        }, token, email, name.includes('Gerente') ? 'ADMIN' : 'MOTORISTA');

        // Navega novamente para forçar o Zustand a ler do localStorage
        await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    }
 else {
        console.error(`Falha ao obter token para ${email}`);
    }
  }

  // Espera extra para garantir que componentes como gráficos e mapas carreguem
  await new Promise(r => setTimeout(r, 5000));
  await page.waitForSelector('canvas, .leaflet-container', { timeout: 10000 }).catch(() => console.log("Aviso: Gráfico ou Mapa não detectado, mas continuando..."));
  
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}.png`), fullPage: true });
  await browser.close();
  console.log(`✅ ${name} salvo.`);
}

(async () => {
  try {
    // 1. Dashboard Gerente
    await capture('02_Dashboard_Gerente', 'admin@zelamapa.com', 'senha123');

    // 2. App Motorista
    await capture('03_App_Motorista', 'motorista1@zelamapa.com', 'senha123');

    // 3. App Cidadão (Cadastro)
    await capture('04_App_Cidadao', null, null, 'cidadao');

    console.log('\n🚀 Todos os prints foram gerados com sucesso!');
  } catch (err) {
    console.error('Erro na captura:', err);
    process.exit(1);
  }
})();
