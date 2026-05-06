/**
 * Google Apps Script — Fake Door Leads Collector
 * 
 * INSTRUÇÕES DE DEPLOY:
 * 1. Abra https://script.google.com
 * 2. Crie um novo projeto
 * 3. Cole este código
 * 4. Em "Implantar" → "Nova implantação" → Tipo: "App da Web"
 * 5. Executar como: "Eu" (sua conta Google)
 * 6. Quem pode acessar: "Qualquer pessoa"
 * 7. Copie a URL gerada e coloque no .env do Next.js como GOOGLE_SHEETS_WEBHOOK_URL
 * 
 * PRÉ-REQUISITO: Crie 3 Google Sheets manualmente com o nome:
 * - "Fake Door A — Gestor Público"
 * - "Fake Door B — Chatbot WhatsApp" 
 * - "Fake Door C — PME Burocracia"
 * 
 * Cada sheet deve ter uma aba "Leads" com headers em A1:L1:
 * Timestamp | Test ID | Source | Nome | Email | Cargo | Orgao | Telefone | Empresa | Segmento | Porte | Dor
 */

// Substitua pelos IDs das suas 3 sheets (encontra na URL da sheet)
const SHEET_IDS = {
  'A': 'COLE_AQUI_O_ID_DA_SHEET_A',
  'B': 'COLE_AQUI_O_ID_DA_SHEET_B',
  'C': 'COLE_AQUI_O_ID_DA_SHEET_C',
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const testId = data.test_id || 'A';
    const sheetId = SHEET_IDS[testId];
    
    if (!sheetId) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid test_id' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName('Leads') || ss.getSheets()[0];
    
    const row = [
      data.timestamp || new Date().toISOString(),
      data.test_id || '',
      data.source || '',
      data.nome || '',
      data.email || '',
      data.cargo || '',
      data.orgao || '',
      data.telefone || '',
      data.empresa || '',
      data.segmento || '',
      data.porte || '',
      data.dor || '',
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'BXat Fake Door webhook is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}