/**
 * Abogado Puhon Inventory: Google Sheet backend.
 *
 * Paste this whole file into the Apps Script editor of the Google Sheet
 * (Extensions > Apps Script), set STORE_CODE below, then
 * Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 *
 * Tabs are created by themselves: Settings, Products, Moves, Photos.
 * Each row holds one record as JSON (column C) plus a readable summary (column D).
 * Do not edit column C by hand. Use the app to change data.
 */
const STORE_CODE = 'CHANGE-THIS-CODE';
// Only needed if you made the script at script.google.com instead of from inside the Sheet.
// Paste the Sheet's ID here (the long text between /d/ and /edit in the Sheet's address).
const SHEET_ID = '';
const TZ = 'Asia/Manila';
const TABS = { settings: 'Settings', products: 'Products', moves: 'Moves', photos: 'Photos' };

function sheet_(col) {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  const name = TABS[col];
  if (!name) throw new Error('unknown collection');
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, 4).setValues([['id', 'updated', 'json', 'summary']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function codeOk_(code) {
  return String(code || '') === STORE_CODE && STORE_CODE !== 'CHANGE-THIS-CODE';
}

function fmt_(t) {
  return Utilities.formatDate(new Date(t), TZ, 'yyyy-MM-dd HH:mm');
}

function summary_(col, d) {
  try {
    if (col === 'products') return (d.name || '') + ' | ' + (d.cat || '') + (d.hidden ? ' | REMOVED' : '');
    if (col === 'settings') return d.store || '';
    if (col === 'photos') return 'photo';
    if (col === 'moves') {
      const n = (d.items || []).reduce(function (a, i) { return a + (+i.qty || 0); }, 0);
      const flag = (d.void ? ' | VOID' : '') + (d.status === 'preorder' ? ' | PRE-ORDER' : '');
      if (d.type === 'sale') return fmt_(d.t) + ' | ' + (d.customer || 'Walk-in') + ' | ' + n + ' pcs | total ' + d.total + ' | paid ' + (d.paid || 0) + flag;
      if (d.type === 'pay') return fmt_(d.t) + ' | payment | ' + d.customer + ' | ' + d.total + flag;
      if (d.type === 'in') return fmt_(d.t) + ' | stock in | ' + n + ' pcs | cost ' + d.total + flag;
      if (d.type === 'adj') return fmt_(d.t) + ' | count fix | ' + n + ' | ' + (d.note || '') + flag;
    }
  } catch (e) { /* ignore */ }
  return '';
}

function ver_() {
  return PropertiesService.getScriptProperties().getProperty('ver') || '0';
}

function readAll_() {
  const res = { settings: null, products: [], moves: [], photos: {} };
  Object.keys(TABS).forEach(function (col) {
    const sh = sheet_(col);
    const n = sh.getLastRow() - 1;
    if (n < 1) return;
    const rows = sh.getRange(2, 1, n, 3).getValues();
    rows.forEach(function (r) {
      const id = String(r[0] || '');
      if (!id || !r[2]) return;
      let d;
      try { d = JSON.parse(r[2]); } catch (e) { return; }
      if (col === 'settings') { if (id === 'main') res.settings = d; }
      else if (col === 'photos') res.photos[id] = d.d;
      else { d.id = id; res[col].push(d); }
    });
  });
  return res;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!codeOk_(p.code)) return out_({ ok: false, error: 'code' });
  if (p.action === 'ping') return out_({ ok: true, ver: ver_() });
  const ver = ver_();
  if (p.since && String(p.since) === ver) return out_({ ok: true, same: true, ver: ver });
  const all = readAll_();
  all.ok = true;
  all.ver = ver;
  return out_(all);
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad request' }); }
  if (!codeOk_(body.code)) return out_({ ok: false, error: 'code' });
  const ops = body.ops || [];
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    const touched = {};
    ops.forEach(function (op) {
      if (!TABS[op.col] || !op.id) return;
      const sh = sheet_(op.col);
      const n = sh.getLastRow() - 1;
      const ids = n > 0 ? sh.getRange(2, 1, n, 1).getValues() : [];
      let row = -1;
      for (let i = 0; i < ids.length; i++) { if (String(ids[i][0]) === String(op.id)) { row = i + 2; break; } }
      if (op.op === 'del') {
        if (row > 0) sh.deleteRow(row);
      } else if (op.op === 'set') {
        const json = JSON.stringify(op.data);
        if (json.length > 49000) throw new Error('record too large');
        const vals = [[String(op.id), new Date().toISOString(), json, summary_(op.col, op.data)]];
        if (row > 0) sh.getRange(row, 1, 1, 4).setValues(vals);
        else sh.getRange(sh.getLastRow() + 1, 1, 1, 4).setValues(vals);
      }
      touched[op.col] = true;
    });
    const v = String(Date.now());
    PropertiesService.getScriptProperties().setProperty('ver', v);
    return out_({ ok: true, ver: v });
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}
