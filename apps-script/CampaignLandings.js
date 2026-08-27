var GALICIA_PRIMARY_LANDING_KEY = 'charla-pymes';
var GALICIA_OFFICE_BANKING_LANDING_KEY = 'office-banking';
var CAMPAIGN_LANDING_BACKFILL_KEY = 'campaign_landings_v1_backfill';
var CAMPAIGN_ATTRIBUTION_BACKFILL_KEY = 'campaign_attribution_v2_backfill';
var CAMPAIGN_LANDING_FOUNDATION_CACHE_KEY = 'campaign_landings_foundation:v2:schema-' + APP.SCHEMA_VERSION;

function normalizeCampaignLandingPath_(value) {
  var raw=safeString_(value).trim();
  if (!raw) return '';
  raw=raw.replace(/^https?:\/\/[^/]+/i,'');
  raw=raw.split('?')[0].split('#')[0];
  if (raw.charAt(0)!=='/') raw='/'+raw;
  return raw.replace(/\/{2,}/g,'/').replace(/\/$/,'')||'/';
}

function campaignLandingSeedRows_() {
  return [
    {
      campaign_key:GALICIA.CAMPAIGN_KEY,
      landing_key:GALICIA_PRIMARY_LANDING_KEY,
      name:'Galicia · Charla Pymes',
      path:'/bonificacion-galicia',
      benefit_label:'50% de bonificación en el primer mes',
      benefit_percent:50,
      badge:'Beneficio exclusivo · cupos limitados',
      kicker:'Charla | Pymes que venden más: cómo arrancar de cero con publicidad, automatización e IA.',
      headline:'Gracias por compartir este espacio en Galicia.',
      headline_accent:'Activá tu beneficio con Fedes.',
      description:'Registrá tu empresa para acceder a un 50% de bonificación en el primer mes de nuestro Onboarding estratégico. Primero entendemos tu negocio; después diseñamos el camino.',
      seo_title:'Galicia 2026 | Beneficio exclusivo | Fedes',
      seo_description:'Beneficio exclusivo Galicia 2026 para participantes de la charla Pymes que venden más. Registrá tu empresa y accedé al Onboarding estratégico de Fedes.',
      source_default:'galicia_charla_pymes',
      utm_source_default:'galicia',
      utm_medium_default:'event',
      utm_campaign_default:'beneficio_galicia_2026',
      sort_order:10,
      featured:true,
      status:APP.STATUS.PUBLISHED,
      metadata_json:jsonStringify_({
        client:'fedes_landing_galicia_charla',
        methodNote:'El Onboarding comienza con una etapa de diagnóstico y auditoría profunda que puede extenderse hasta 60 días y se integra a un roadmap de crecimiento anual.',
        resultNote:'La bonificación queda sujeta a disponibilidad de cupo y validación final del alcance.'
      })
    },
    {
      campaign_key:GALICIA.CAMPAIGN_KEY,
      landing_key:GALICIA_OFFICE_BANKING_LANDING_KEY,
      name:'Galicia · Office Banking',
      path:'/bono-galicia',
      benefit_label:'30% de bonificación en el primer mes',
      benefit_percent:30,
      badge:'Beneficio exclusivo Galicia',
      kicker:'Beneficio para empresas',
      headline:'Potenciá la estructura de tu empresa.',
      headline_accent:'Activá tu beneficio con Fedes.',
      description:'Registrá tu empresa para acceder a un 30% de bonificación en el primer mes de nuestro Onboarding estratégico. Primero entendemos tu negocio; después diseñamos el camino.',
      seo_title:'Beneficio Galicia | Onboarding estratégico para empresas | Fedes',
      seo_description:'Beneficio exclusivo para empresas de Galicia. Registrá tu empresa y accedé a un 30% de bonificación en el primer mes del Onboarding estratégico de Fedes.',
      source_default:'galicia_office_banking',
      utm_source_default:'galicia',
      utm_medium_default:'office_banking',
      utm_campaign_default:'beneficio_galicia_office_banking_2026',
      sort_order:20,
      featured:false,
      status:APP.STATUS.DRAFT,
      metadata_json:jsonStringify_({
        client:'fedes_landing_galicia_office_banking',
        utmContent:'banner',
        methodNote:'El Onboarding comienza con una etapa de diagnóstico y auditoría profunda que puede extenderse hasta 60 días y se integra a un roadmap de crecimiento anual.',
        resultNote:'La bonificación queda sujeta a validación final del alcance y a las condiciones vigentes del beneficio.'
      })
    }
  ];
}

function inferLegacyLandingKey_(row) {
  var source=(safeString_(row&&row.source)+' '+safeString_(row&&row.utm_medium)+' '+safeString_(row&&row.utm_campaign)+' '+safeString_(row&&row.page_path)).toLowerCase();
  return source.indexOf('office_banking')>=0 || source.indexOf('/bono-galicia')>=0
    ? GALICIA_OFFICE_BANKING_LANDING_KEY
    : GALICIA_PRIMARY_LANDING_KEY;
}

function backfillCampaignLandingKeys_() {
  if (systemGet_(CAMPAIGN_LANDING_BACKFILL_KEY)==='done') return;

  dbReadAll_(APP.SHEETS.LEADS,{includeArchived:true}).forEach(function(row){
    if (safeString_(row.campaign_key)!==GALICIA.CAMPAIGN_KEY || safeString_(row.landing_key)) return;
    dbUpdateById_(APP.SHEETS.LEADS,row.lead_id,{landing_key:inferLegacyLandingKey_(row)});
  });

  dbReadAll_(APP.SHEETS.LEAD_EVENTS,{includeArchived:true}).forEach(function(row){
    if (safeString_(row.campaign_key)!==GALICIA.CAMPAIGN_KEY || safeString_(row.landing_key)) return;
    dbUpdateById_(APP.SHEETS.LEAD_EVENTS,row.event_id,{landing_key:inferLegacyLandingKey_(row)});
  });

  systemSet_(CAMPAIGN_LANDING_BACKFILL_KEY,'done');
}

function backfillCampaignAttribution_() {
  if (systemGet_(CAMPAIGN_ATTRIBUTION_BACKFILL_KEY)==='done') return;
  dbPatchWhere_(APP.SHEETS.LEADS,function(row){
    return !safeString_(row.last_landing_key)||!safeString_(row.last_source);
  },function(row){
    var patch={};
    if (!safeString_(row.last_landing_key)) patch.last_landing_key=safeString_(row.landing_key);
    if (!safeString_(row.last_source)) patch.last_source=safeString_(row.source);
    return patch;
  });
  systemSet_(CAMPAIGN_ATTRIBUTION_BACKFILL_KEY,'done');
}

function ensureCampaignLandingFoundation_(force) {
  var cache=CacheService.getScriptCache();
  if (!safeBoolean_(force) && cache.get(CAMPAIGN_LANDING_FOUNDATION_CACHE_KEY)==='ready') return;

  ensureSheet_(APP.SHEETS.CAMPAIGN_LANDINGS,SCHEMA[APP.SHEETS.CAMPAIGN_LANDINGS]);
  ensureSheet_(APP.SHEETS.LEADS,SCHEMA[APP.SHEETS.LEADS]);
  ensureSheet_(APP.SHEETS.LEAD_EVENTS,SCHEMA[APP.SHEETS.LEAD_EVENTS]);

  campaignLandingSeedRows_().forEach(function(seed){
    var existing=dbFindOne_(APP.SHEETS.CAMPAIGN_LANDINGS,function(row){
      return safeString_(row.campaign_key)===seed.campaign_key && safeString_(row.landing_key)===seed.landing_key;
    },{includeArchived:true});
    if (!existing) dbInsert_(APP.SHEETS.CAMPAIGN_LANDINGS,seed);
  });

  backfillCampaignLandingKeys_();
  backfillCampaignAttribution_();
  cache.put(CAMPAIGN_LANDING_FOUNDATION_CACHE_KEY,'ready',21600);
}

function campaignIsPublicNow_(campaign) {
  if (!campaign || safeString_(campaign.status)!==APP.STATUS.PUBLISHED || safeString_(campaign.archived_at)) return false;
  var now=Date.now();
  var starts=Date.parse(campaign.starts_at||'');
  if (isFinite(starts) && starts>now) return false;
  var ends=Date.parse(campaign.ends_at||'');
  if (isFinite(ends) && ends<now) return false;
  return true;
}

function normalizeCampaignLandingForOutput_(landing,campaign) {
  var out=normalizeRecordForOutput_(landing||{});
  var meta=jsonParse_(out.metadata_json,{});
  if (!meta || typeof meta!=='object' || Array.isArray(meta)) meta={};
  out.path=normalizeCampaignLandingPath_(out.path);
  out.benefit_percent=safeNumber_(out.benefit_percent,0);
  out.featured=safeBoolean_(out.featured);
  out.campaign=campaign?{
    campaign_key:safeString_(campaign.campaign_key),
    name:safeString_(campaign.name),
    meeting_url:safeString_(campaign.meeting_url),
    starts_at:campaign.starts_at||'',
    ends_at:campaign.ends_at||'',
    status:safeString_(campaign.status)
  }:null;
  out.meta=meta;
  return out;
}

function getCampaignLandingPublic_(pathOrKey) {
  ensureCampaignLandingFoundation_();
  var lookup=safeString_(pathOrKey);
  var normalizedPath=normalizeCampaignLandingPath_(lookup);
  var landing=dbFindOne_(APP.SHEETS.CAMPAIGN_LANDINGS,function(row){
    if (safeString_(row.status)!==APP.STATUS.PUBLISHED || safeString_(row.archived_at)) return false;
    return safeString_(row.landing_key)===lookup || normalizeCampaignLandingPath_(row.path)===normalizedPath;
  });
  if (!landing) return null;
  var campaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){
    return safeString_(row.campaign_key)===safeString_(landing.campaign_key);
  });
  if (!campaignIsPublicNow_(campaign)) return null;
  return normalizeCampaignLandingForOutput_(landing,campaign);
}

function getCampaignLandingsPublic_(campaignKey) {
  ensureCampaignLandingFoundation_();
  var key=safeString_(campaignKey);
  var campaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){ return safeString_(row.campaign_key)===key; });
  if (!campaignIsPublicNow_(campaign)) return [];
  return dbReadAll_(APP.SHEETS.CAMPAIGN_LANDINGS).filter(function(row){
    return safeString_(row.campaign_key)===key && safeString_(row.status)===APP.STATUS.PUBLISHED;
  }).sort(function(a,b){ return safeNumber_(a.sort_order,999)-safeNumber_(b.sort_order,999); }).map(function(row){
    return normalizeCampaignLandingForOutput_(row,campaign);
  });
}

function getCampaignLandingInternalByKey_(campaignKey,landingKey) {
  ensureCampaignLandingFoundation_();
  return dbFindOne_(APP.SHEETS.CAMPAIGN_LANDINGS,function(row){
    return safeString_(row.campaign_key)===safeString_(campaignKey) && safeString_(row.landing_key)===safeString_(landingKey);
  },{includeArchived:true});
}

function getCampaignLandingForLead_(lead) {
  var key=safeString_(lead&&lead.landing_key)||GALICIA_PRIMARY_LANDING_KEY;
  return getCampaignLandingInternalByKey_(safeString_(lead&&lead.campaign_key)||GALICIA.CAMPAIGN_KEY,key);
}

function getCampaignLandingPathForLead_(lead) {
  var landing=getCampaignLandingForLead_(lead);
  return normalizeCampaignLandingPath_(landing&&landing.path)||'/bonificacion-galicia';
}

function adminSetCampaignPublicState_(token,campaignKey,enabled) {
  var session=requireAdminSession_(token);
  var key=safeString_(campaignKey);
  var campaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){ return safeString_(row.campaign_key)===key; },{includeArchived:true});
  if (!campaign) throw new Error('Campaña no encontrada');
  if (safeString_(campaign.archived_at)) throw new Error('Restaurá la campaña antes de publicarla.');
  var nextStatus=safeBoolean_(enabled)?APP.STATUS.PUBLISHED:APP.STATUS.HIDDEN;
  if (safeString_(campaign.status)===nextStatus) return {success:true,unchanged:true,campaign:normalizeRecordForOutput_(campaign)};
  var saved=dbUpdateById_(APP.SHEETS.CAMPAIGNS,campaign.campaign_id,{status:nextStatus});
  audit_(session.actor,'admin',APP.SHEETS.CAMPAIGNS,campaign.campaign_id,safeBoolean_(enabled)?'publish_campaign':'hide_campaign',campaign,saved,'react_admin');
  invalidatePublicCache_();
  return {success:true,campaign:normalizeRecordForOutput_(saved)};
}
