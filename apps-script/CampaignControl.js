function campaignHeroRuntimeState_(campaign, mediaMap) {
  var row=campaign||{};
  var metadata=jsonParse_(row.metadata_json,{});
  if (!metadata || typeof metadata!=='object' || Array.isArray(metadata)) metadata={};
  var banner=metadata.hero_banner;
  if (!banner || typeof banner!=='object' || Array.isArray(banner)) banner={};

  mediaMap=mediaMap||publicMediaMap_();
  var desktopId=safeString_(banner.desktop_media_id);
  var mobileId=safeString_(banner.mobile_media_id);
  var desktopMedia=desktopId?mediaMap[desktopId]||null:null;
  var mobileMedia=mobileId?mediaMap[mobileId]||null:null;
  var desktopUrl=desktopMedia?mediaPublicImageUrl_(desktopMedia):'';
  var mobileUrl=mobileMedia?mediaPublicImageUrl_(mobileMedia):'';
  var enabled=safeBoolean_(banner.enabled);

  var now=Date.now();
  var starts=Date.parse(row.starts_at||'');
  var ends=Date.parse(row.ends_at||'');
  var campaignPublished=safeString_(row.status)===APP.STATUS.PUBLISHED&&!safeString_(row.archived_at);
  var inDateRange=campaignPublished;
  if (isFinite(starts)&&starts>now) inDateRange=false;
  if (isFinite(ends)&&ends<now) inDateRange=false;

  var reason='active';
  if (!campaignPublished) reason='campaign_hidden';
  else if (isFinite(starts)&&starts>now) reason='scheduled';
  else if (isFinite(ends)&&ends<now) reason='ended';
  else if (!enabled) reason='hero_disabled';
  else if (!desktopId || !desktopUrl) reason='missing_desktop';
  else if (!mobileId || !mobileUrl) reason='missing_mobile';

  var active=reason==='active';
  return {
    enabled:enabled,
    active:active,
    reason:reason,
    campaignPublished:campaignPublished,
    inDateRange:inDateRange,
    desktopReady:!!desktopUrl,
    mobileReady:!!mobileUrl,
    desktopMediaId:desktopId,
    mobileMediaId:mobileId,
    updatedAt:row.updated_at||'',
    checkedAt:nowIso_()
  };
}

function campaignIntegritySummary_(campaign,landings,heroState) {
  var rows=Array.isArray(landings)?landings:[];
  var published=rows.filter(function(row){return safeString_(row.status)===APP.STATUS.PUBLISHED&&!safeString_(row.archived_at);});
  var checks=[];

  function push(key,label,ok,detail,severity) {
    checks.push({key:key,label:label,ok:!!ok,detail:safeString_(detail),severity:severity||(!ok?'warning':'ok')});
  }

  push('campaign_status','Campaña publicable',safeString_(campaign&&campaign.status)===APP.STATUS.PUBLISHED,
    safeString_(campaign&&campaign.status)||'sin estado');
  push('campaign_dates','Vigencia configurada',!!safeString_(campaign&&campaign.starts_at),
    safeString_(campaign&&campaign.starts_at)?'Inicio configurado':'Falta fecha de inicio');
  push('landings','Landings configuradas',rows.length>0,rows.length+' configurada(s)');
  push('published_landings','Landing pública disponible',published.length>0,published.length+' publicada(s)');
  push('hero_media','Hero con medios válidos',heroState&&heroState.desktopReady&&heroState.mobileReady,
    heroState&&heroState.desktopReady&&heroState.mobileReady?'Desktop y mobile listos':'Revisá las imágenes del Hero');
  push('hero_runtime','Estado real del Hero',heroState&&heroState.active,
    heroState&&heroState.active?'Visible ahora':'No visible: '+safeString_(heroState&&heroState.reason),heroState&&heroState.active?'ok':'info');

  published.forEach(function(landing){
    var key=safeString_(landing.landing_key)||safeString_(landing.path)||'landing';
    push('path_'+key,'Ruta · '+key,!!normalizeCampaignLandingPath_(landing.path),safeString_(landing.path)||'sin ruta');
    push('source_'+key,'Atribución · '+key,!!safeString_(landing.source_default),safeString_(landing.source_default)||'sin source');
  });

  var passed=checks.filter(function(check){return check.ok;}).length;
  return {
    passed:passed,
    total:checks.length,
    score:checks.length?Math.round(passed*100/checks.length):100,
    checks:checks
  };
}

function getHeroRuntimePublic_(campaignKey) {
  var key=safeString_(campaignKey);
  var campaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){return safeString_(row.campaign_key)===key;},{includeArchived:true});
  if (!campaign) return {success:true,campaignKey:key,active:false,reason:'campaign_missing',campaign:null,checkedAt:nowIso_()};

  var media=publicMediaMap_();
  var state=campaignHeroRuntimeState_(campaign,media);
  return {
    success:true,
    campaignKey:key,
    active:state.active,
    reason:state.reason,
    revision:safeString_(campaign.updated_at),
    checkedAt:state.checkedAt,
    campaign:state.active?normalizePublicCampaign_(campaign,media):null
  };
}

function getHeroRuntimesPublic_() {
  var media=publicMediaMap_();
  var rows=dbReadAll_(APP.SHEETS.CAMPAIGNS,{includeArchived:true});
  var campaigns=[];
  var states={};

  rows.forEach(function(campaign){
    if (safeString_(campaign.archived_at)) return;
    var key=safeString_(campaign.campaign_key);
    if (!key) return;
    var state=campaignHeroRuntimeState_(campaign,media);
    states[key]={
      active:state.active,
      enabled:state.enabled,
      reason:state.reason,
      revision:safeString_(campaign.updated_at)
    };
    if (state.active) campaigns.push(normalizePublicCampaign_(campaign,media));
  });

  campaigns.sort(function(a,b){return safeNumber_(a.sort_order,0)-safeNumber_(b.sort_order,0);});
  return {success:true,campaigns:campaigns,states:states,checkedAt:nowIso_()};
}

function adminSetCampaignHeroEnabled_(token,campaignKey,enabled) {
  var session=requireAdminSession_(token);
  var key=safeString_(campaignKey);
  var campaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){return safeString_(row.campaign_key)===key;},{includeArchived:true});
  if (!campaign) throw new Error('Campaña no encontrada');
  if (safeString_(campaign.archived_at)) throw new Error('Restaurá la campaña antes de modificar el Hero.');

  var metadata=jsonParse_(campaign.metadata_json,{});
  if (!metadata || typeof metadata!=='object' || Array.isArray(metadata)) metadata={};
  var banner=metadata.hero_banner;
  if (!banner || typeof banner!=='object' || Array.isArray(banner)) banner={};
  banner=Object.assign({},banner,{enabled:safeBoolean_(enabled)});
  metadata.hero_banner=banner;

  var saved=dbUpdateById_(APP.SHEETS.CAMPAIGNS,campaign.campaign_id,{metadata_json:jsonStringify_(metadata)});
  audit_(session.actor,'admin',APP.SHEETS.CAMPAIGNS,campaign.campaign_id,safeBoolean_(enabled)?'enable_hero':'disable_hero',campaign,saved,'react_admin');
  invalidatePublicCache_();

  var state=campaignHeroRuntimeState_(saved||campaign,publicMediaMap_());
  return {success:true,campaign:normalizeRecordForOutput_(saved||campaign),hero:state};
}
