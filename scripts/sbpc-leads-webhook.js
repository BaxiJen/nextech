/**
 * Google Apps Script — Leads SBPC 2026 — BaXi × Zhipu
 * Recebe dados do formulário em baxijen.com.br/sbpc-cadastro
 * Deploy: script.google.com → New Project → Paste → Deploy → Web App → Anyone
 * 
 * Chamada: URL_EXEC?email=joao@teste.com&nome=Joao&sobrenome=Silva&profissao=pesquisador&instituicao=UFF&contato_zhipu=true&novidades_baxi=false&termos=true
 */

var SHEET_ID = '1dRqq8orTyjACS11l9KCww6aBdSti96HvGKknOs63EtE';

function doGet(e) {
  if (e.parameter && e.parameter.email) {
    return handleLead(e.parameter);
  }
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'SBPC 2026 webhook running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
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
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName('Página1') || ss.getSheets()[0];
    
    var row = [
      data.timestamp || new Date().toISOString(),
      data.nome || '',
      data.sobrenome || '',
      data.email || '',
      data.profissao || '',
      data.instituicao || '',
      data.contato_zhipu === 'true' || data.contato_zhipu === true ? 'Sim' : 'Não',
      data.novidades_baxi === 'true' || data.novidades_baxi === true ? 'Sim' : 'Não',
      data.termos === 'true' || data.termos === true ? 'Sim' : 'Não',
      data.evento || 'sbpc_2026',
      data.parceria || 'baxi_zhipu',
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}