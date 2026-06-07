/**
 * BOOST CRM — Notion-backend (Google Apps Script)
 * ------------------------------------------------
 * Ontvangt leads van de Boost Scan en zet ze veilig in een Notion-database.
 * Levert ze ook terug aan het dashboard (/bh33r), schrijft statuswijzigingen
 * (Nieuw / Gebeld / Gewonnen) en verwijderingen terug, en mailt optioneel Dennis.
 *
 * Waarom deze tussenstap? De browser mag de Notion-API niet rechtstreeks
 * aanroepen (CORS) en je geheime token mag nooit in de live site staan.
 * Dit script draait bij Google, verborgen, en praat namens jou met Notion.
 *
 * SETUP — zie boost-crm-setup.md (stap voor stap, ~5 min).
 *   1) Vul hieronder NOTION_TOKEN en NOTION_DB_ID in.
 *   2) (optioneel) Zet NOTIFY op het e-mailadres van Dennis.
 *   3) Implementeren -> Nieuwe implementatie -> type "Web-app"
 *        Uitvoeren als: Ikzelf   |   Wie heeft toegang: Iedereen
 *      Kopieer de "Web app URL" (eindigt op /exec) en geef die door.
 */

var NOTION_TOKEN = '';   // 'secret_xxx' of 'ntn_xxx' — uit je Notion-integratie
var NOTION_DB_ID = '';   // de database-ID (32 tekens uit de Notion-URL)
var NOTIFY       = '';   // bv. 'dennis@mrboost.nl' — leeg = geen mail

var NOTION_VERSION = '2022-06-28';

/* Statuscodes van het dashboard <-> labels in Notion */
var STATUS_TO_NOTION = { 'new': 'Nieuw', 'called': 'Gebeld', 'won': 'Gewonnen' };
var NOTION_TO_STATUS = { 'Nieuw': 'new', 'Gebeld': 'called', 'Gewonnen': 'won' };

/* ===================== inkomend ===================== */

function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}

  try {
    if (data.type === 'lead' && data.lead) {
      createLead(data.lead);
      notify(data.lead);
    } else if (data.type === 'status') {
      var pageId = findPageId(data.id);
      if (pageId) patchPage(pageId, {
        properties: { 'Status': { select: { name: STATUS_TO_NOTION[data.status] || 'Nieuw' } } }
      });
    } else if (data.type === 'delete') {
      var pid = findPageId(data.id);
      if (pid) patchPage(pid, { archived: true });
    }
  } catch (err) {}

  return json({ ok: true });
}

function doGet(e) {
  var out = { leads: [] };
  try { out.leads = listLeads(); } catch (err) { out.error = String(err); }
  var body = JSON.stringify(out);
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + body + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

/* ===================== Notion ===================== */

function createLead(l) {
  var props = {
    'Naam':       { title: [{ text: { content: l.name || 'Onbekend' } }] },
    'Bedrijf':    { rich_text: [{ text: { content: l.company || '' } }] },
    'Status':     { select: { name: STATUS_TO_NOTION[l.status] || 'Nieuw' } },
    'Lead ID':    { rich_text: [{ text: { content: l.id || '' } }] },
    'Datum':      { date: { start: new Date(l.ts || Date.now()).toISOString() } }
  };
  if (l.email) props['E-mail']    = { email: l.email };
  if (l.phone) props['Telefoon']  = { phone_number: l.phone };
  if (l.value) props['Waarde']    = { select: { name: l.value } };
  if (l.recognise && l.recognise.length) props['Herkenning'] = { multi_select: toOptions(l.recognise) };
  if (l.ambition  && l.ambition.length)  props['Ambitie']    = { multi_select: toOptions(l.ambition) };
  if (l.risk      && l.risk.length)      props['Risico']     = { multi_select: toOptions(l.risk) };

  notionFetch('https://api.notion.com/v1/pages', 'post', {
    parent: { database_id: NOTION_DB_ID },
    properties: props
  });
}

function listLeads() {
  var leads = [];
  var cursor = null;
  do {
    var payload = { page_size: 100, sorts: [{ property: 'Datum', direction: 'descending' }] };
    if (cursor) payload.start_cursor = cursor;
    var res = notionFetch('https://api.notion.com/v1/databases/' + NOTION_DB_ID + '/query', 'post', payload);
    (res.results || []).forEach(function (pg) { leads.push(pageToLead(pg)); });
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  leads.sort(function (a, b) { return b.ts - a.ts; });
  return leads;
}

function pageToLead(pg) {
  var p = pg.properties || {};
  var notionStatus = sel(p['Status']);
  return {
    id:        rich(p['Lead ID']) || pg.id,
    ts:        dateMs(p['Datum']) || new Date(pg.created_time).getTime(),
    name:      title(p['Naam']),
    company:   rich(p['Bedrijf']),
    email:     (p['E-mail'] && p['E-mail'].email) || '',
    phone:     (p['Telefoon'] && p['Telefoon'].phone_number) || '',
    recognise: multi(p['Herkenning']),
    ambition:  multi(p['Ambitie']),
    risk:      multi(p['Risico']),
    value:     sel(p['Waarde']),
    status:    NOTION_TO_STATUS[notionStatus] || 'new'
  };
}

function findPageId(leadId) {
  if (!leadId) return null;
  var res = notionFetch('https://api.notion.com/v1/databases/' + NOTION_DB_ID + '/query', 'post', {
    page_size: 1,
    filter: { property: 'Lead ID', rich_text: { equals: String(leadId) } }
  });
  return (res.results && res.results[0]) ? res.results[0].id : null;
}

function patchPage(pageId, body) {
  notionFetch('https://api.notion.com/v1/pages/' + pageId, 'patch', body);
}

function notionFetch(url, method, payload) {
  var resp = UrlFetchApp.fetch(url, {
    method: method,
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + NOTION_TOKEN,
      'Notion-Version': NOTION_VERSION
    },
    payload: JSON.stringify(payload || {}),
    muteHttpExceptions: true
  });
  var txt = resp.getContentText();
  try { return JSON.parse(txt); } catch (e) { return {}; }
}

/* ===================== helpers ===================== */

function toOptions(arr) {
  return arr.map(function (v) { return { name: String(v).replace(/,/g, ' ') }; });
}
function title(prop) {
  return (prop && prop.title && prop.title[0] && prop.title[0].plain_text) || '';
}
function rich(prop) {
  return (prop && prop.rich_text && prop.rich_text[0] && prop.rich_text[0].plain_text) || '';
}
function sel(prop) {
  return (prop && prop.select && prop.select.name) || '';
}
function multi(prop) {
  return (prop && prop.multi_select) ? prop.multi_select.map(function (o) { return o.name; }) : [];
}
function dateMs(prop) {
  if (prop && prop.date && prop.date.start) { return new Date(prop.date.start).getTime(); }
  return 0;
}
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function notify(l) {
  if (!NOTIFY) return;
  try {
    MailApp.sendEmail(NOTIFY,
      'Nieuwe Boost lead: ' + (l.name || '') + ' (' + (l.company || '') + ')',
      'Naam: ' + l.name + '\nBedrijf: ' + l.company + '\nE-mail: ' + l.email +
      '\nTelefoon: ' + l.phone + '\nWaarde: ' + l.value +
      '\n\nHerkenning: ' + (l.recognise || []).join(', ') +
      '\nAmbitie: ' + (l.ambition || []).join(', ') +
      '\nRisico: ' + (l.risk || []).join(', '));
  } catch (e) {}
}
