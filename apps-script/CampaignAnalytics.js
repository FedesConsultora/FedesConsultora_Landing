function campaignAnalyticsMeta_(row) {
  var parsed=jsonParse_(row&&row.metadata_json,{});
  return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
}

function campaignAnalyticsPath_(value) {
  var raw=safeString_(value);
  if (!raw) return '';
  try {
    if (/^https?:\/\//i.test(raw)) return normalizeCampaignLandingPath_(raw);
  } catch (err) {
    // Se intenta igual con el normalizador de paths.
  }
  return normalizeCampaignLandingPath_(raw);
}

function campaignAnalyticsLandingKey_(row,meta,landings) {
  var explicit=safeString_(meta.landing_key||meta.landingKey);
  if (explicit) return explicit;

  var candidates=[
    meta.landing_path,
    meta.page_path,
    meta.click_url,
    row&&row.page_path
  ].map(campaignAnalyticsPath_).filter(Boolean);

  for (var i=0;i<(landings||[]).length;i++) {
    var landing=landings[i];
    var landingPath=normalizeCampaignLandingPath_(landing.path);
    if (landingPath && candidates.indexOf(landingPath)>=0) return safeString_(landing.landing_key);
  }
  return '';
}

function campaignAnalyticsMatches_(row,campaignKey,landings) {
  var meta=campaignAnalyticsMeta_(row);
  var explicit=safeString_(meta.campaign_key||meta.campaignKey);
  if (explicit) return explicit===campaignKey;

  var landingKey=campaignAnalyticsLandingKey_(row,meta,landings);
  if (landingKey) return (landings||[]).some(function(landing){
    return safeString_(landing.landing_key)===landingKey && safeString_(landing.campaign_key)===campaignKey;
  });

  var utmCampaign=safeString_(meta.utm_campaign||meta.utmCampaign);
  return utmCampaign===campaignKey;
}

function campaignAnalyticsSessionIds_(rows) {
  var seen={};
  (rows||[]).forEach(function(row){
    var id=safeString_(row.session_id);
    if (id) seen[id]=true;
  });
  return seen;
}

function campaignAnalyticsUniqueSessions_(rows) {
  return Object.keys(campaignAnalyticsSessionIds_(rows)).length;
}

function campaignLeadFirstAttribution_(lead) {
  var meta=jsonParse_(lead&&lead.metadata_json,{});
  var first=meta&&meta.firstAttribution&&typeof meta.firstAttribution==='object'&&!Array.isArray(meta.firstAttribution)
    ? meta.firstAttribution
    : {};
  return {
    sessionId:safeString_(first.sessionId)||safeString_(lead&&lead.session_id),
    visitorId:safeString_(first.visitorId)||safeString_(lead&&lead.visitor_id),
    landingKey:safeString_(first.landingKey)||safeString_(lead&&lead.landing_key),
    source:safeString_(first.source)||safeString_(lead&&lead.source)
  };
}

function campaignLinkedLeadStats_(leads,visits) {
  var visitSessions=campaignAnalyticsSessionIds_(visits);
  var linked=0,withSession=0;
  (leads||[]).forEach(function(lead){
    var sessionId=campaignLeadFirstAttribution_(lead).sessionId;
    if (!sessionId) return;
    withSession++;
    if (visitSessions[sessionId]) linked++;
  });
  return {
    withSession:withSession,
    linked:linked,
    coverage:campaignAnalyticsRate_(withSession,(leads||[]).length),
    sessionToLead:campaignAnalyticsRate_(linked,Object.keys(visitSessions).length)
  };
}

function campaignAnalyticsRate_(numerator,denominator) {
  if (!denominator) return 0;
  return Math.round((safeNumber_(numerator,0)*1000)/safeNumber_(denominator,1))/10;
}

function campaignAnalyticsSourceCounts_(rows) {
  var out={};
  (rows||[]).forEach(function(row){
    var meta=campaignAnalyticsMeta_(row);
    var source=safeString_(row.source)||safeString_(meta.source)||'Sin origen';
    out[source]=(out[source]||0)+1;
  });
  return out;
}

function adminGetCampaignFunnel_(token,campaignKey) {
  requireAdminSession_(token);
  ensureCampaignLandingFoundation_();

  var key=safeString_(campaignKey);
  var landings=dbReadAll_(APP.SHEETS.CAMPAIGN_LANDINGS,{includeArchived:true}).filter(function(row){
    return safeString_(row.campaign_key)===key && !safeString_(row.archived_at);
  });
  var analytics=dbReadAll_(APP.SHEETS.ANALYTICS,{includeArchived:true}).filter(function(row){
    return campaignAnalyticsMatches_(row,key,landings);
  });
  var leads=dbReadAll_(APP.SHEETS.LEADS,{includeArchived:true}).filter(function(row){
    return safeString_(row.campaign_key)===key && !safeString_(row.archived_at);
  });
  var answers=dbReadAll_(APP.SHEETS.LEAD_ANSWERS,{includeArchived:true}).filter(function(row){
    return safeString_(row.campaign_key)===key && !safeString_(row.archived_at);
  });

  var impressions=analytics.filter(function(row){return safeString_(row.label)==='hero_banner_impression';});
  var clicks=analytics.filter(function(row){return safeString_(row.label)==='hero_banner_click';});
  var visits=analytics.filter(function(row){return safeString_(row.label)==='campaign_landing_view';});
  var completed=leads.filter(function(row){return safeString_(row.status)==='complete';});
  var linkedStats=campaignLinkedLeadStats_(leads,visits);

  var answerCountByLead={};
  var answerDistribution={};
  answers.forEach(function(answer){
    var leadId=safeString_(answer.lead_id);
    if (leadId) answerCountByLead[leadId]=(answerCountByLead[leadId]||0)+1;
    var question=safeString_(answer.question_key)||'sin_pregunta';
    var option=safeString_(answer.answer_key)||'Sin respuesta';
    if (!answerDistribution[question]) answerDistribution[question]={};
    answerDistribution[question][option]=(answerDistribution[question][option]||0)+1;
  });

  var responders=leads.filter(function(lead){return safeNumber_(answerCountByLead[safeString_(lead.lead_id)],0)>0;});
  var byLanding={};

  landings.forEach(function(landing){
    var landingKey=safeString_(landing.landing_key);
    var landingVisits=visits.filter(function(row){
      return campaignAnalyticsLandingKey_(row,campaignAnalyticsMeta_(row),landings)===landingKey;
    });
    var landingClicks=clicks.filter(function(row){
      return campaignAnalyticsLandingKey_(row,campaignAnalyticsMeta_(row),landings)===landingKey;
    });
    var landingLeads=leads.filter(function(row){return campaignLeadFirstAttribution_(row).landingKey===landingKey;});
    var landingResponders=landingLeads.filter(function(row){return safeNumber_(answerCountByLead[safeString_(row.lead_id)],0)>0;});
    var landingComplete=landingLeads.filter(function(row){return safeString_(row.status)==='complete';});
    var landingLinked=campaignLinkedLeadStats_(landingLeads,landingVisits);

    byLanding[landingKey]={
      landingKey:landingKey,
      path:normalizeCampaignLandingPath_(landing.path),
      name:safeString_(landing.name),
      views:landingVisits.length,
      uniqueViews:campaignAnalyticsUniqueSessions_(landingVisits),
      bannerClicks:landingClicks.length,
      leads:landingLeads.length,
      responders:landingResponders.length,
      complete:landingComplete.length,
      linkedLeads:landingLinked.linked,
      leadsWithSession:landingLinked.withSession,
      sessionCoverage:landingLinked.coverage,
      sessionToLead:landingLinked.sessionToLead,
      viewToLead:campaignAnalyticsRate_(landingLeads.length,landingVisits.length),
      leadToResponse:campaignAnalyticsRate_(landingResponders.length,landingLeads.length),
      leadToComplete:campaignAnalyticsRate_(landingComplete.length,landingLeads.length),
      visitSources:campaignAnalyticsSourceCounts_(landingVisits)
    };
  });

  var responderRows=responders.slice().sort(function(a,b){
    return String(b.last_activity_at||b.updated_at||b.created_at||'').localeCompare(String(a.last_activity_at||a.updated_at||a.created_at||''));
  }).slice(0,40).map(function(lead){
    return {
      lead_id:safeString_(lead.lead_id),
      full_name:safeString_(lead.full_name),
      company:safeString_(lead.company),
      email:safeString_(lead.email),
      landing_key:safeString_(lead.landing_key),
      last_landing_key:safeString_(lead.last_landing_key),
      source:safeString_(lead.source),
      last_source:safeString_(lead.last_source),
      session_id:safeString_(lead.session_id),
      utm_source:safeString_(lead.utm_source),
      utm_medium:safeString_(lead.utm_medium),
      utm_campaign:safeString_(lead.utm_campaign),
      utm_content:safeString_(lead.utm_content),
      answer_count:safeNumber_(answerCountByLead[safeString_(lead.lead_id)],0),
      last_question_key:safeString_(lead.last_question_key),
      status:safeString_(lead.status),
      classification:safeString_(lead.classification),
      last_activity_at:lead.last_activity_at||lead.updated_at||lead.created_at||''
    };
  });

  return {
    success:true,
    stats:{
      impressions:impressions.length,
      bannerClicks:clicks.length,
      landingViews:visits.length,
      uniqueLandingSessions:campaignAnalyticsUniqueSessions_(visits),
      identifiedLeads:leads.length,
      leadsWithSession:linkedStats.withSession,
      linkedLeads:linkedStats.linked,
      sessionCoverage:linkedStats.coverage,
      sessionToLead:linkedStats.sessionToLead,
      responders:responders.length,
      complete:completed.length,
      clickToVisit:campaignAnalyticsRate_(visits.length,clicks.length),
      viewToLead:campaignAnalyticsRate_(leads.length,visits.length),
      leadToResponse:campaignAnalyticsRate_(responders.length,leads.length),
      leadToComplete:campaignAnalyticsRate_(completed.length,leads.length)
    },
    byLanding:byLanding,
    visitSources:campaignAnalyticsSourceCounts_(visits),
    answerDistribution:answerDistribution,
    responders:responderRows,
    trackingNote:'Sesión → lead usa únicamente sesiones que pueden vincularse de forma determinística entre AN_Events y CRM_Leads. Los registros históricos anteriores al tracking de sesión permanecen visibles, pero no se inventa su atribución.'
  };
}

function adminGetCampaign360WithFunnel_(token,campaignKey) {
  var base=adminGetCampaign360(token,campaignKey);
  var landingData=adminGetCampaignLandings_(token,campaignKey);
  var rawCampaign=dbFindOne_(APP.SHEETS.CAMPAIGNS,function(row){return safeString_(row.campaign_key)===safeString_(campaignKey);},{includeArchived:true})||{};
  var hero=campaignHeroRuntimeState_(rawCampaign,publicMediaMap_());
  base.funnel=adminGetCampaignFunnel_(token,campaignKey);
  base.landings=landingData.landings||[];
  base.hero=hero;
  base.integrity=campaignIntegritySummary_(rawCampaign,base.landings,hero);
  base.publicState={
    campaignPublic:campaignIsPublicNow_(rawCampaign),
    heroActive:hero.active,
    heroReason:hero.reason,
    publishedLandings:(base.landings||[]).filter(function(row){return safeString_(row.status)===APP.STATUS.PUBLISHED&&!safeString_(row.archived_at);}).length,
    totalLandings:(base.landings||[]).filter(function(row){return !safeString_(row.archived_at);}).length
  };
  return base;
}