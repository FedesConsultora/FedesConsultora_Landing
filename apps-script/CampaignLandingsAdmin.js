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
    var duplicate=dbFindOne_(APP.SHEETS.CAMPAIGN_LANDINGS,function(row){
      return safeString_(row.landing_id)!==safeString_(before.landing_id) && !safeString_(row.archived_at) && normalizeCampaignLandingPath_(row.path)===clean.path;
    },{includeArchived:true});
    if (duplicate) throw new Error('Ya existe otra landing con esa ruta');
  }
  var saved=dbUpdateById_(APP.SHEETS.CAMPAIGN_LANDINGS,before.landing_id,clean);
  audit_(session.actor,'admin',APP.SHEETS.CAMPAIGN_LANDINGS,before.landing_id,'update_landing',before,saved,'react_admin');
  invalidatePublicCache_();
  return {success:true,landing:normalizeCampaignLandingForOutput_(saved,null)};
}
