/**
 * Google Apps Script — Fake Door Leads Collector v2
 * Usa GET com query string ao invés de POST (mais confiável com Apps Script)
 * Deploy: script.google.com → New Project → Paste → Deploy → Web App → Anyone
 * 
 * Chamada: URL_EXEC?test_id=A&nome=Joao&email=joao@teste.com&cargo=Gestor&dor=Burocracia
 */

const SHEET_IDS = {
  'A': '1sWJAZG63yDkXAt6NGLAjnIEep_giyXGPz6Qzyz8_dLo',
  'B': '1Y1u2f3iBuxxkdq_RwGGlOfzZpHtbqTJ4eZJdjd9bNdA',
  'C': '1oggKdGbG4eC5vuIsqpjHBmt81DJDKYRjviSJ0MVKKBI',
};

function doGet(e) {
  // Se veio com parâmetros, é um lead
  if (e.parameter && e.parameter.test_id) {
    return handleLead(e.parameter);
  }
  // Se não, é health check
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'BXat Fake Door webhook running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // Mantém POST para compatibilidade, se funcionar
  try {
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }
    return handleLead(data);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLead(data) {
  try {
    var testId = data.test_id || 'A';
    var sheetId = SHEET_IDS[testId];
    
    if (!sheetId) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid test_id' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheets()[0];
    
    var row = [
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