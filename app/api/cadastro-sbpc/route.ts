import { NextResponse } from 'next/server';

// Google OAuth credentials (from gog CLI config)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || '';
const SHEET_ID = '1dRqq8orTyjACS11l9KCww6aBdSti96HvGKknOs63EtE';
const SHEET_TAB = 'Página1';

interface CadastroData {
  email: string;
  nome: string;
  sobrenome: string;
  profissao: string;
  instituicao?: string;
  contato_zhipu: boolean;
  novidades_baxi: boolean;
  termos: boolean;
  timestamp?: string;
  evento?: string;
  parceria?: string;
}

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh token: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function appendToSheet(accessToken: string, row: string[]) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_TAB)}!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API error: ${err}`);
  }

  return res.json();
}

export async function POST(request: Request) {
  try {
    const body: CadastroData = await request.json();

    // Validar campos obrigatórios
    if (!body.email || !body.nome || !body.sobrenome || !body.profissao) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: email, nome, sobrenome, profissao' },
        { status: 400 }
      );
    }

    // Termos deve estar aceito
    if (!body.termos) {
      return NextResponse.json(
        { error: 'É necessário aceitar os termos e condições para continuar.' },
        { status: 403 }
      );
    }

    // Se não tiver credenciais configuradas, salva só em log
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
      console.log('[SBPC Cadastro] Credenciais Google não configuradas. Lead:', {
        email: body.email,
        nome: `${body.nome} ${body.sobrenome}`,
        profissao: body.profissao,
      });
      return NextResponse.json({ success: true, message: 'Lead recebido (modo log — configurar credenciais)' });
    }

    // 1. Obter access token
    const accessToken = await getAccessToken();

    // 2. Montar linha para a planilha
    const row = [
      body.timestamp || new Date().toISOString(),
      body.nome,
      body.sobrenome,
      body.email,
      body.profissao,
      body.instituicao || '',
      body.contato_zhipu ? 'Sim' : 'Não',
      body.novidades_baxi ? 'Sim' : 'Não',
      body.termos ? 'Sim' : 'Não',
      body.evento || 'sbpc_2026',
      body.parceria || 'baxi_zhipu',
    ];

    // 3. Gravar na Google Sheet
    await appendToSheet(accessToken, row);

    return NextResponse.json({ success: true, message: 'Cadastro realizado com sucesso!' });
  } catch (error) {
    console.error('[SBPC Cadastro] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cadastro' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'SBPC 2026 cadastro API running' });
}