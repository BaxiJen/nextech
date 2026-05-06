/**
 * Google Apps Script — Fake Door Leads Collector
 * Deploy: script.google.com → New Project → Paste → Deploy → Web App → Anyone
 */

const SHEET_IDS = {
  'A': '1sWJAZG63yDkXAt6NGLAjnIEep_giyXGPz6Qzyz8_dLo',
  'B': '1Y1u2f3iBuxxkdq_RwGGlOfzZpHtbqTJ4eZJdjd9bNdA',
  'C': '1oggKdGbG4eC5vuIsqpjHBmt81DJDKYRjviSJ0MVKKBI',
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
    const sheet = ss.getSheets()[0];
    
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
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'BXat Fake Door webhook running' }))
    .setMimeType(ContentService.MimeType.JSON);
}