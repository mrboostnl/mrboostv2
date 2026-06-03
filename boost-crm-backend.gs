/**
 * BOOST CRM — backend (Google Apps Script)
 * Ontvangt leads van de Boost Scan, schrijft ze naar een Google Sheet,
 * levert ze terug aan het dashboard (/bh33r) en mailt optioneel Dennis.
 *
 * SETUP (eenmalig, ~3 min):
 *  1. Ga naar https://sheets.new  → maak een leeg Spreadsheet.
 *  2. Extensies → Apps Script. Verwijder de voorbeeldcode en plak DIT bestand.
 *  3. (optioneel) Zet hieronder NOTIFY op het e-mailadres van Dennis.
 *  4. Implementeren → Nieuwe implementatie → type "Web-app".
 *       - Uitvoeren als: Ikzelf
 *       - Wie heeft toegang: Iedereen
 *     Kopieer de "Web app URL" en plak die in boost-config.js (endpoint).
 */

var SHEET  = 'Leads';
var NOTIFY = '';   // bv. 'dennis@mrboost.nl' — leeg = geen mail

function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}
  var sh = getSheet();

  if (data.type === 'lead' && data.lead) {
    var l = data.lead;
    sh.appendRow([
      l.id, new Date(l.ts || Date.now()), l.name, l.company, l.email, l.phone,
      (l.recognise || []).join(' | '), (l.ambition || []).join(' | '),
      (l.risk || []).join(' | '), l.value, l.status || 'new'
    ]);
    if (NOTIFY) {
      MailApp.sendEmail(NOTIFY,
        'Nieuwe Boost lead: ' + (l.name || '') + ' (' + (l.company || '') + ')',
        'Naam: ' + l.name + '\nBedrijf: ' + l.company + '\nE-mail: ' + l.email +
        '\nTelefoon: ' + l.phone + '\nWaarde: ' + l.value +
        '\n\nHerkenning: ' + (l.recognise || []).join(', ') +
        '\nAmbitie: ' + (l.ambition || []).join(', ') +
        '\nRisico: ' + (l.risk || []).join(', '));
    }
  } else if (data.type === 'status') {
    updateCell(sh, data.id, 11, data.status);
  } else if (data.type === 'delete') {
    deleteRow(sh, data.id);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sh = getSheet();
  var rows = sh.getDataRange().getValues();
  rows.shift(); // header
  var leads = rows.filter(function (r) { return r[0]; }).map(function (r) {
    return {
      id: r[0], ts: new Date(r[1]).getTime(), name: r[2], company: r[3],
      email: r[4], phone: r[5], recognise: split(r[6]), ambition: split(r[7]),
      risk: split(r[8]), value: r[9], status: r[10] || 'new'
    };
  });
  leads.sort(function (a, b) { return b.ts - a.ts; });
  var out = JSON.stringify({ leads: leads });
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + out + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(out)
    .setMimeType(ContentService.MimeType.JSON);
}

function split(v) { return v ? String(v).split(' | ') : []; }

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(['id', 'datum', 'naam', 'bedrijf', 'email', 'telefoon',
      'herkenning', 'ambitie', 'risico', 'waarde', 'status']);
  }
  return sh;
}

function updateCell(sh, id, col, val) {
  var d = sh.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]) === String(id)) { sh.getRange(i + 1, col).setValue(val); return; }
  }
}

function deleteRow(sh, id) {
  var d = sh.getDataRange().getValues();
  for (var i = 1; i < d.length; i++) {
    if (String(d[i][0]) === String(id)) { sh.deleteRow(i + 1); return; }
  }
}
