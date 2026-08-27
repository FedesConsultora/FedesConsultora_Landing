var DB_REQUEST_ACTIVE_ = false;
var DB_REQUEST_SPREADSHEET_ = null;
var DB_REQUEST_ROWS_ = {};
var DB_REQUEST_HEADERS_ = {};

function dbBeginRequest_() {
  DB_REQUEST_ACTIVE_ = true;
  DB_REQUEST_SPREADSHEET_ = null;
  DB_REQUEST_ROWS_ = {};
  DB_REQUEST_HEADERS_ = {};
}

function dbEndRequest_() {
  DB_REQUEST_ACTIVE_ = false;
  DB_REQUEST_SPREADSHEET_ = null;
  DB_REQUEST_ROWS_ = {};
  DB_REQUEST_HEADERS_ = {};
}

function dbInvalidateRequestCache_(sheetName) {
  if (!DB_REQUEST_ACTIVE_) return;
  if (sheetName) {
    delete DB_REQUEST_ROWS_[sheetName];
    delete DB_REQUEST_HEADERS_[sheetName];
    return;
  }
  DB_REQUEST_ROWS_ = {};
  DB_REQUEST_HEADERS_ = {};
}

function getSpreadsheet_() {
  if (DB_REQUEST_ACTIVE_ && DB_REQUEST_SPREADSHEET_) return DB_REQUEST_SPREADSHEET_;

  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(APP.PROPS.SPREADSHEET_ID);
  var spreadsheet = id ? SpreadsheetApp.openById(id) : null;

  if (!spreadsheet) {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) {
      props.setProperty(APP.PROPS.SPREADSHEET_ID, active.getId());
      spreadsheet = active;
    }
  }

  if (!spreadsheet) {
    spreadsheet = SpreadsheetApp.create('FEDES Landing CMS DB');
    props.setProperty(APP.PROPS.SPREADSHEET_ID, spreadsheet.getId());
  }

  if (DB_REQUEST_ACTIVE_) DB_REQUEST_SPREADSHEET_ = spreadsheet;
  return spreadsheet;
}

function ensureSheet_(sheetName, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  var existingCols = sheet.getLastColumn();
  var existingHeaders = existingCols ? sheet.getRange(1,1,1,existingCols).getValues()[0].map(String) : [];
  if (!existingHeaders.length || existingHeaders.every(function(v){ return !v; })) {
    sheet.clear();
    sheet.getRange(1,1,1,headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,headers.length).setFontWeight('bold');
    dbInvalidateRequestCache_(sheetName);
    return sheet;
  }

  var missing = headers.filter(function(h){ return existingHeaders.indexOf(h) === -1; });
  if (missing.length) {
    var start = existingHeaders.length + 1;
    sheet.getRange(1,start,1,missing.length).setValues([missing]);
    dbInvalidateRequestCache_(sheetName);
  }
  sheet.setFrozenRows(1);
  return sheet;
}

function dbHeaders_(sheet) {
  var sheetName = sheet.getName();
  if (DB_REQUEST_ACTIVE_ && DB_REQUEST_HEADERS_[sheetName]) return DB_REQUEST_HEADERS_[sheetName].slice();
  var lastColumn = sheet.getLastColumn();
  if (!lastColumn) return [];
  var headers = sheet.getRange(1,1,1,lastColumn).getValues()[0].map(function(v){ return String(v); });
  if (DB_REQUEST_ACTIVE_) DB_REQUEST_HEADERS_[sheetName] = headers.slice();
  return headers;
}

function dbReadAll_(sheetName, options) {
  options = options || {};
  var cachedRows = DB_REQUEST_ACTIVE_ ? DB_REQUEST_ROWS_[sheetName] : null;
  var rows;

  if (cachedRows) {
    rows = cachedRows;
  } else {
    var sheet = getSpreadsheet_().getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) {
      rows = [];
    } else {
      var headers = dbHeaders_(sheet);
      var values = sheet.getRange(2,1,sheet.getLastRow()-1,headers.length).getValues();
      rows = values.map(function(row) {
        var obj = {};
        headers.forEach(function(h, i) { obj[h] = normalizeCellValue_(row[i]); });
        return obj;
      });
    }
    if (DB_REQUEST_ACTIVE_) DB_REQUEST_ROWS_[sheetName] = rows;
  }

  var result = rows;
  if (!options.includeArchived) {
    var schema = SCHEMA[sheetName] || [];
    if (schema.indexOf('archived_at') >= 0) result = rows.filter(function(r){ return !safeString_(r.archived_at); });
  }

  // Los consumidores pueden ordenar/transformar sin contaminar el snapshot del request.
  return result.map(function(row){ return Object.assign({}, row); });
}

function dbFindOne_(sheetName, predicate, options) {
  var rows = dbReadAll_(sheetName, options);
  for (var i=0; i<rows.length; i++) if (predicate(rows[i])) return rows[i];
  return null;
}

function dbFindById_(sheetName, id, options) {
  var pk = PRIMARY_KEYS[sheetName];
  if (!pk) throw new Error('No primary key configured for ' + sheetName);
  return dbFindOne_(sheetName, function(r){ return String(r[pk]) === String(id); }, options);
}

function dbWriteRow_(sheet, headers, record, rowNumber) {
  var values = headers.map(function(h) {
    var v = record[h];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object' && !(v instanceof Date)) return JSON.stringify(v);
    return v;
  });
  sheet.getRange(rowNumber,1,1,headers.length).setValues([values]);
}

function dbInsert_(sheetName, record) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSpreadsheet_().getSheetByName(sheetName);
    if (!sheet) throw new Error('Missing sheet ' + sheetName);
    var headers = dbHeaders_(sheet);
    var pk = PRIMARY_KEYS[sheetName];
    var row = Object.assign({}, record || {});
    if (pk && !row[pk]) row[pk] = uuid_();
    if (headers.indexOf('created_at') >= 0 && !row.created_at) row.created_at = nowIso_();
    if (headers.indexOf('updated_at') >= 0 && !row.updated_at) row.updated_at = nowIso_();
    dbWriteRow_(sheet, headers, row, sheet.getLastRow()+1);
    dbInvalidateRequestCache_(sheetName);
    return normalizeRecordForOutput_(row);
  } finally {
    lock.releaseLock();
  }
}

function dbUpdateById_(sheetName, id, patch) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSpreadsheet_().getSheetByName(sheetName);
    if (!sheet) throw new Error('Missing sheet ' + sheetName);
    var headers = dbHeaders_(sheet);
    var pk = PRIMARY_KEYS[sheetName];
    var pkIndex = headers.indexOf(pk);
    if (pkIndex < 0) throw new Error('Missing primary key header ' + pk);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;
    var ids = sheet.getRange(2, pkIndex+1, lastRow-1, 1).getValues();
    for (var i=0; i<ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        var rowNum = i+2;
        var currentVals = sheet.getRange(rowNum,1,1,headers.length).getValues()[0];
        var current = {};
        headers.forEach(function(h,j){ current[h] = normalizeCellValue_(currentVals[j]); });
        var next = Object.assign({}, current, patch || {});
        next[pk] = current[pk];
        if (headers.indexOf('updated_at') >= 0) next.updated_at = nowIso_();
        dbWriteRow_(sheet, headers, next, rowNum);
        dbInvalidateRequestCache_(sheetName);
        return normalizeRecordForOutput_(next);
      }
    }
    return null;
  } finally {
    lock.releaseLock();
  }
}

function dbUpsert_(sheetName, record, matchFn) {
  var existing = dbFindOne_(sheetName, matchFn, {includeArchived:true});
  if (existing) return dbUpdateById_(sheetName, existing[PRIMARY_KEYS[sheetName]], record);
  return dbInsert_(sheetName, record);
}

function dbArchiveById_(sheetName, id) {
  var patch = { archived_at: nowIso_() };
  if (SCHEMA[sheetName].indexOf('status') >= 0) patch.status = APP.STATUS.ARCHIVED;
  return dbUpdateById_(sheetName, id, patch);
}

function dbRestoreById_(sheetName, id) {
  var patch = { archived_at: '' };
  if (SCHEMA[sheetName].indexOf('status') >= 0) patch.status = APP.STATUS.DRAFT;
  return dbUpdateById_(sheetName, id, patch);
}

function dbDeleteWhere_(sheetName, predicate) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSpreadsheet_().getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return 0;
    var headers = dbHeaders_(sheet);
    var values = sheet.getRange(2,1,sheet.getLastRow()-1,headers.length).getValues();
    var deleteRows = [];
    values.forEach(function(row, idx) {
      var obj = {};
      headers.forEach(function(h,i){ obj[h] = normalizeCellValue_(row[i]); });
      if (predicate(obj)) deleteRows.push(idx+2);
    });
    deleteRows.sort(function(a,b){ return b-a; }).forEach(function(r){ sheet.deleteRow(r); });
    if (deleteRows.length) dbInvalidateRequestCache_(sheetName);
    return deleteRows.length;
  } finally { lock.releaseLock(); }
}

function sortPublished_(rows) {
  return rows.sort(function(a,b){
    var sa = safeNumber_(a.sort_order, 9999), sb = safeNumber_(b.sort_order, 9999);
    if (sa !== sb) return sa - sb;
    return String(a.created_at || '').localeCompare(String(b.created_at || ''));
  });
}

function invalidatePublicCache_() {
  CacheService.getScriptCache().removeAll(['bootstrap','blog','gallery','modules','cases','team','testimonials','campaigns']);
}
