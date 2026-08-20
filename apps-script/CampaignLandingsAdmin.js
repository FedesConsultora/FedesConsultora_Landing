function adminGetCampaignLandings_(token,campaignKey) {
  requireAdminSession_(token);
  ensureCampaignLandingFoundation_();
  var key=safeString_(campaignKey);
  var campaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){return safeString_(row.campaign_key)===key;},{includeArchived:true});
  if (!campaign) throw new Error('Campaña no encontrada');
  var rows=dbReadAll_(APP.SHEETS.CAMPAIGN_LANDINGS,{includeArchived:true}).filter(function(row){
    return safeString_(row.campaign_key)===key;
  }).sort(function(a,b){return safeNumber_(a.sort_order,999)-safeNumber_(b.sort_order,999);});
  return {
    success:true,
    campaign:{campaign_key:key,status:safeString_(campaign.status)},
    landings:rows.map(function(row){return normalizeCampaignLandingForOutput_(row,campaign);})
  };
}

function normalizeCampaignLandingKey_(value) {
  return safeString_(value).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function validateCampaignLandingUniqueness_(campaignKey,landingKey,path,excludeLandingId) {
  var duplicateKey=dbFindOne_(APP.SHEETS.CAMPAIGN_LANDINGS,function(row){
    return safeString_(row.landing_id)!==safeString_(excludeLandingId) &&
      !safeString_(row.archived_at) &&
      safeString_(row.campaign_key)===safeString_(campaignKey) &&
      safeString_(row.landing_key)===safeString_(landingKey);
  },{includeArchived:true});
  if (duplicateKey) throw new Error('Ya existe una landing con esa clave dentro de la campaña');

  var duplicatePath=dbFindOne_(APP.SHEETS.CAMPAIGN_LANDINGS,function(row){
    return safeString_(row.landing_id)!==safeString_(excludeLandingId) &&
      !safeString_(row.archived_at) &&
      normalizeCampaignLandingPath_(row.path)===path;
  },{includeArchived:true});
  if (duplicatePath) throw new Error('Ya existe otra landing con esa ruta');
}

function adminCreateCampaignLanding_(token,campaignKey,record) {
  var session=requireAdminSession_(token);
  ensureCampaignLandingFoundation_();
  var key=safeString_(campaignKey);
  var campaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){return safeString_(row.campaign_key)===key;},{includeArchived:true});
  if (!campaign) throw new Error('Campaña no encontrada');
  if (safeString_(campaign.archived_at)) throw new Error('Restaurá la campaña antes de agregar landings.');

  var incoming=record&&typeof record==='object'?record:{};
  var landingKey=normalizeCampaignLandingKey_(incoming.landing_key||incoming.name||incoming.path);
  var path=normalizeCampaignLandingPath_(incoming.path);
  var name=safeString_(incoming.name);
  var benefitLabel=safeString_(incoming.benefit_label);

  if (!landingKey || landingKey.length<2) throw new Error('Ingresá una clave de landing válida');
  if (landingKey.length>64) throw new Error('La clave de landing es demasiado larga');
  if (!path || path==='/') throw new Error('La ruta de landing no es válida');
  if (!name) throw new Error('Ingresá un nombre interno');
  if (!benefitLabel) throw new Error('Ingresá el texto del beneficio');

  validateCampaignLandingUniqueness_(key,landingKey,path,'');

  var saved=dbInsert_(APP.SHEETS.CAMPAIGN_LANDINGS,{
    campaign_key:key,
    landing_key:landingKey,
    name:name,
    path:path,
    benefit_label:benefitLabel,
    benefit_percent:safeNumber_(incoming.benefit_percent,0),
    badge:safeString_(incoming.badge),
    kicker:safeString_(incoming.kicker),
    headline:safeString_(incoming.headline),
    headline_accent:safeString_(incoming.headline_accent),
    description:safeString_(incoming.description),
    seo_title:safeString_(incoming.seo_title),
    seo_description:safeString_(incoming.seo_description),
    source_default:safeString_(incoming.source_default),
    utm_source_default:safeString_(incoming.utm_source_default),
    utm_medium_default:safeString_(incoming.utm_medium_default),
    utm_campaign_default:safeString_(incoming.utm_campaign_default),
    sort_order:safeNumber_(incoming.sort_order,999),
    featured:safeBoolean_(incoming.featured),
    status:APP.STATUS.DRAFT,
    metadata_json:safeString_(incoming.metadata_json)||'{}'
  });

  audit_(session.actor,'admin',APP.SHEETS.CAMPAIGN_LANDINGS,saved.landing_id,'create_landing',null,saved,'react_admin');
  invalidatePublicCache_();
  return {success:true,landing:normalizeCampaignLandingForOutput_(saved,campaign)};
}

function adminSetCampaignLandingStatus_(token,landingId,status) {
  var session=requireAdminSession_(token);
  ensureCampaignLandingFoundation_();
  var allowed=[APP.STATUS.DRAFT,APP.STATUS.PUBLISHED,APP.STATUS.HIDDEN];
  var next=safeString_(status);
  if (allowed.indexOf(next)<0) throw new Error('Estado de landing inválido');
  var before=dbFindById_(APP.SHEETS.CAMPAIGN_LANDINGS,safeString_(landingId),{includeArchived:true});
  if (!before) throw new Error('Landing no encontrada');
  if (safeString_(before.archived_at)) throw new Error('Restaurá la landing antes de cambiar su estado.');
  var saved=dbUpdateById_(APP.SHEETS.CAMPAIGN_LANDINGS,before.landing_id,{status:next});
  audit_(session.actor,'admin',APP.SHEETS.CAMPAIGN_LANDINGS,before.landing_id,'set_landing_status',before,saved,'react_admin');
  invalidatePublicCache_();
  return {success:true,landing:normalizeCampaignLandingForOutput_(saved,null)};
}

function adminUpdateCampaignLanding_(token,landingId,patch) {
  var session=requireAdminSession_(token);
  ensureCampaignLandingFoundation_();
  var before=dbFindById_(APP.SHEETS.CAMPAIGN_LANDINGS,safeString_(landingId),{includeArchived:true});
  if (!before) throw new Error('Landing no encontrada');
  var incoming=patch&&typeof patch==='object'?patch:{};
  var allowed=[
    'name','path','benefit_label','benefit_percent','badge','kicker','headline','headline_accent','description',
    'seo_title','seo_description','source_default','utm_source_default','utm_medium_default','utm_campaign_default',
    'sort_order','featured','metadata_json'
  ];
  var clean={};
  allowed.forEach(function(field){
    if (incoming[field]===undefined) return;
    var value=incoming[field];
    if (field==='benefit_percent'||field==='sort_order') value=safeNumber_(value,0);
    else if (field==='featured') value=safeBoolean_(value);
    else value=safeString_(value);
    clean[field]=value;
  });
  if (clean.path!==undefined) {
    clean.path=normalizeCampaignLandingPath_(clean.path);
    if (!clean.path || clean.path==='/') throw new Error('La ruta de landing no es válida');
    validateCampaignLandingUniqueness_(before.campaign_key,before.landing_key,clean.path,before.landing_id);
  }
  var saved=dbUpdateById_(APP.SHEETS.CAMPAIGN_LANDINGS,before.landing_id,clean);
  audit_(session.actor,'admin',APP.SHEETS.CAMPAIGN_LANDINGS,before.landing_id,'update_landing',before,saved,'react_admin');
  invalidatePublicCache_();
  return {success:true,landing:normalizeCampaignLandingForOutput_(saved,null)};
}
