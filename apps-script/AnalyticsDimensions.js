var ANALYTICS_DIMENSIONS_CACHE_KEY='analytics_dimensions_schema:v1:schema-'+APP.SCHEMA_VERSION;
var ANALYTICS_DIMENSIONS_BACKFILL_KEY='analytics_dimensions_v1_backfill';

function ensureAnalyticsDimensionsSchema_(force) {
  var cache=CacheService.getScriptCache();
  if(!safeBoolean_(force)&&cache.get(ANALYTICS_DIMENSIONS_CACHE_KEY)==='ready')return;
  ensureSheet_(APP.SHEETS.ANALYTICS,SCHEMA[APP.SHEETS.ANALYTICS]);
  cache.put(ANALYTICS_DIMENSIONS_CACHE_KEY,'ready',21600);
}

function analyticsDimensionPatch_(row) {
  var meta=jsonParse_(row&&row.metadata_json,{});
  if(!meta||typeof meta!=='object'||Array.isArray(meta))meta={};
  var page=normalizeCampaignLandingPath_(safeString_(row&&row.page_path)||safeString_(meta.page_path)||safeString_(meta.pagePath));
  var label=safeString_(row&&row.label);
  var value=safeString_(row&&row.value);
  var campaign=safeString_(row&&row.campaign_key)||safeString_(meta.campaign_key)||safeString_(meta.campaignKey);
  var landing=safeString_(row&&row.landing_key)||safeString_(meta.landing_key)||safeString_(meta.landingKey);

  if(!campaign&&['hero_banner_impression','hero_banner_click','hero_banner_auto_advance','hero_banner_manual_advance'].indexOf(label)>=0)campaign=value;
  if(!campaign&&(page==='/bonificacion-galicia'||page==='/bono-galicia'))campaign=GALICIA.CAMPAIGN_KEY;
  if(!landing&&page==='/bonificacion-galicia')landing=GALICIA_PRIMARY_LANDING_KEY;
  if(!landing&&page==='/bono-galicia')landing=GALICIA_OFFICE_BANKING_LANDING_KEY;

  return {
    campaign_key:campaign,
    landing_key:landing,
    visitor_id:safeString_(row&&row.visitor_id)||safeString_(meta.visitor_id)||safeString_(meta.visitorId),
    session_id:safeString_(row&&row.session_id)||safeString_(meta.session_id)||safeString_(meta.sessionId),
    source:safeString_(row&&row.source)||safeString_(meta.source)||'landing',
    utm_source:safeString_(row&&row.utm_source)||safeString_(meta.utm_source)||safeString_(meta.utmSource),
    utm_medium:safeString_(row&&row.utm_medium)||safeString_(meta.utm_medium)||safeString_(meta.utmMedium),
    utm_campaign:safeString_(row&&row.utm_campaign)||safeString_(meta.utm_campaign)||safeString_(meta.utmCampaign),
    utm_content:safeString_(row&&row.utm_content)||safeString_(meta.utm_content)||safeString_(meta.utmContent)
  };
}

function backfillAnalyticsDimensions_() {
  ensureAnalyticsDimensionsSchema_(true);
  if(systemGet_(ANALYTICS_DIMENSIONS_BACKFILL_KEY)==='done')return{success:true,unchanged:true,rows:0};

  var sheet=getSpreadsheet_().getSheetByName(APP.SHEETS.ANALYTICS);
  if(!sheet||sheet.getLastRow()<2){systemSet_(ANALYTICS_DIMENSIONS_BACKFILL_KEY,'done');return{success:true,rows:0};}

  var headers=dbHeaders_(sheet);
  var count=sheet.getLastRow()-1;
  var values=sheet.getRange(2,1,count,headers.length).getValues();
  var dimensionFields=['campaign_key','landing_key','visitor_id','session_id','source','utm_source','utm_medium','utm_campaign','utm_content'];
  var columns={};
  var enriched=0;
  dimensionFields.forEach(function(field){columns[field]=[];});

  values.forEach(function(raw){
    var row={};
    headers.forEach(function(header,index){row[header]=normalizeCellValue_(raw[index]);});
    var patch=analyticsDimensionPatch_(row);
    var changed=false;
    dimensionFields.forEach(function(field){
      var existing=safeString_(row[field]);
      var next=existing||safeString_(patch[field]);
      if(!existing&&next)changed=true;
      columns[field].push([next]);
    });
    if(changed)enriched++;
  });

  dimensionFields.forEach(function(field){
    var idx=headers.indexOf(field);
    if(idx>=0)sheet.getRange(2,idx+1,count,1).setValues(columns[field]);
  });
  dbInvalidateRequestCache_(APP.SHEETS.ANALYTICS);
  systemSet_(ANALYTICS_DIMENSIONS_BACKFILL_KEY,'done');
  return{success:true,rows:count,enriched:enriched};
}

function ensureAnalyticsDimensions_(backfill) {
  ensureAnalyticsDimensionsSchema_(false);
  if(safeBoolean_(backfill))return backfillAnalyticsDimensions_();
  return{success:true,schemaReady:true};
}

function adminSyncAnalyticsDimensions_(token) {
  requireAdminSession_(token);
  return backfillAnalyticsDimensions_();
}
