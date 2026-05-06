import { createServerSupabaseClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

// Google Sheets webhook URL (will be set via environment variable)
const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

interface FakeDoorLead {
  nome: string;
  email: string;
  source: string; // 'gestor-publico' | 'chatbot-whatsapp' | 'pme'
  test_id: string; // 'A' | 'B' | 'C'
  cargo?: string;
  orgao?: string;
  telefone?: string;
  empresa?: string;
  segmento?: string;
  porte?: string;
  dor?: string;
  whatsapp?: string;
}

export async function POST(request: Request) {
  try {
    const body: FakeDoorLead = await request.json();

    const { nome, email, source, test_id, ...extra } = body;

    if (!nome || !email || !source || !test_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: nome, email, source, test_id' },
        { status: 400 }
      );
    }

    // 1. Save to Supabase
    const supabase = createServerSupabaseClient();

    const { error: dbError } = await supabase
      .from('leads')
      .upsert({
        name: nome,
        email,
        objective: `${source} (${test_id}) — ${extra.cargo || extra.empresa || ''}`,
        source: 'form',
        phone: extra.telefone || extra.whatsapp || null,
        company: extra.orgao || extra.empresa || null,
        notes: JSON.stringify({ source, test_id, ...extra }),
      }, { onConflict: 'email' });

    if (dbError) {
      console.error('Supabase error:', dbError);
      // Continue — don't block on DB error
    }

    // 2. Forward to Google Sheets (via GET query string — Apps Script compatible)
    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      try {
        const params = new URLSearchParams({
          timestamp: new Date().toISOString(),
          test_id,
          source,
          nome,
          email,
          cargo: extra.cargo || '',
          orgao: extra.orgao || '',
          telefone: extra.telefone || extra.whatsapp || '',
          empresa: extra.empresa || '',
          segmento: extra.segmento || '',
          porte: extra.porte || '',
          dor: extra.dor || '',
        });
        await fetch(`${GOOGLE_SHEETS_WEBHOOK_URL}?${params.toString()}`);
      } catch (sheetsError) {
        console.error('Google Sheets webhook error:', sheetsError);
        // Don't block — lead is saved in Supabase
      }
    }

    return NextResponse.json({ success: true, message: 'Lead capturado com sucesso!' });
  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: 'Erro ao processar lead' },
      { status: 500 }
    );
  }
}