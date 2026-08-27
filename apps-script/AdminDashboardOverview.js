function adminGetDashboardOverview_(token) {
  requireAdminSession_(token);
  ensureCampaignLandingFoundation_();

  var leads=dbReadAll_(APP.SHEETS.LEADS),
      contacts=dbReadAll_(APP.SHEETS.CONTACTS),
      campaigns=dbReadAll_(APP.SHEETS.CAMPAIGNS),
      landings=dbReadAll_(APP.SHEETS.CAMPAIGN_LANDINGS),
      onboarding=dbReadAll_(APP.SHEETS.ONBOARDING),
      mailings=dbReadAll_(APP.SHEETS.LEAD_MAILINGS),
      audit=dbReadAll_(APP.SHEETS.AUDIT,{includeArchived:true}),
      analytics=dbReadAll_(APP.SHEETS.ANALYTICS,{includeArchived:true}),
      answers=dbReadAll_(APP.SHEETS.LEAD_ANSWERS);

  var complete=leads.filter(function(row){return safeString_(row.status)==='complete';});
  var qualified=leads.filter(function(row){return safeString_(row.classification)==='CALIFICADO';});
  var landingViews=analytics.filter(function(row){return safeString_(row.label)==='campaign_landing_view';});
  var linkedGlobal=campaignLinkedLeadStats_(leads,landingViews);
  var responderIds={};
  answers.forEach(function(row){var id=safeString_(row.lead_id);if(id)responderIds[id]=true;});
  var responders=leads.filter(function(row){return responderIds[safeString_(row.lead_id)];});
  var activeCampaigns=campaigns.filter(function(row){return campaignIsPublicNow_(row);});

  var attention=leads.filter(function(row){
    var t=Date.parse(row.last_activity_at||row.updated_at||row.created_at||'');
    return safeString_(row.manual_review_status)==='pending'||(safeString_(row.status)==='incomplete'&&isFinite(t)&&(Date.now()-t)>24*3600*1000);
  }).sort(function(a,b){return String(b.last_activity_at||'').localeCompare(String(a.last_activity_at||''));}).slice(0,12);

  var mediaMap=publicMediaMap_();
  var cards=campaigns.map(function(campaign){
    var key=safeString_(campaign.campaign_key);
    var campaignLeads=leads.filter(function(row){return safeString_(row.campaign_key)===key;});
    var campaignComplete=campaignLeads.filter(function(row){return safeString_(row.status)==='complete';});
    var campaignResponders=campaignLeads.filter(function(row){return responderIds[safeString_(row.lead_id)];});
    var campaignLandings=landings.filter(function(row){return safeString_(row.campaign_key)===key&&!safeString_(row.archived_at);});
    var campaignPublishedLandings=campaignLandings.filter(function(row){return safeString_(row.status)===APP.STATUS.PUBLISHED;});
    var campaignVisits=landingViews.filter(function(row){return campaignAnalyticsMatches_(row,key,campaignLandings);});
    var linked=campaignLinkedLeadStats_(campaignLeads,campaignVisits);
    var hero=campaignHeroRuntimeState_(campaign,mediaMap);

    return {
      campaign_id:campaign.campaign_id,
      campaign_key:key,
      name:campaign.name,
      status:campaign.status,
      starts_at:campaign.starts_at,
      ends_at:campaign.ends_at,
      landings:campaignLandings.length,
      publishedLandings:campaignPublishedLandings.length,
      hero:hero,
      views:campaignVisits.length,
      sessions:campaignAnalyticsUniqueSessions_(campaignVisits),
      leads:campaignLeads.length,
      leadsWithSession:linked.withSession,
      linkedLeads:linked.linked,
      sessionCoverage:linked.coverage,
      sessionToLead:linked.sessionToLead,
      responders:campaignResponders.length,
      complete:campaignComplete.length,
      viewToLead:campaignAnalyticsRate_(campaignLeads.length,campaignVisits.length),
      leadToComplete:campaignAnalyticsRate_(campaignComplete.length,campaignLeads.length)
    };
  }).sort(function(a,b){
    if (a.status==='published'&&b.status!=='published') return -1;
    if (b.status==='published'&&a.status!=='published') return 1;
    return String(b.starts_at||'').localeCompare(String(a.starts_at||''));
  });

  var campaignIssues=cards.filter(function(card){
    var heroBroken=card.hero.enabled && (!card.hero.desktopReady || !card.hero.mobileReady);
    return card.status==='published' && (!card.publishedLandings || heroBroken);
  }).length;

  return {
    success:true,
    stats:{
      leads:leads.length,
      leadsWithSession:linkedGlobal.withSession,
      linkedLeads:linkedGlobal.linked,
      sessionCoverage:linkedGlobal.coverage,
      sessionToLead:linkedGlobal.sessionToLead,
      complete:complete.length,
      incomplete:leads.filter(function(row){return safeString_(row.status)==='incomplete';}).length,
      responders:responders.length,
      qualified:qualified.length,
      landingViews:landingViews.length,
      landingSessions:campaignAnalyticsUniqueSessions_(landingViews),
      contacts:contacts.length,
      campaigns:campaigns.length,
      activeCampaigns:activeCampaigns.length,
      onboardings:onboarding.length,
      onboardingCompleted:onboarding.filter(function(row){return safeBoolean_(row.is_completed);}).length,
      mailingsPending:mailings.filter(function(row){return['pending','scheduled'].indexOf(safeString_(row.status))>=0;}).length
    },
    campaigns:cards,
    attention:attention.map(function(row){return adminSanitizeRowForUi_(adminDefs_().leads,row);}),
    recentLeads:leads.slice().sort(function(a,b){return String(b.created_at||'').localeCompare(String(a.created_at||''));}).slice(0,10).map(function(row){return adminSanitizeRowForUi_(adminDefs_().leads,row);}),
    recentAudit:audit.slice(-10).reverse(),
    health:{
      campaignIssues:campaignIssues,
      analyticsEvents:analytics.length,
      analyticsSessions:campaignAnalyticsUniqueSessions_(analytics),
      leadsWithLanding:leads.filter(function(row){return!!safeString_(row.landing_key);}).length,
      leadsWithLastLanding:leads.filter(function(row){return!!safeString_(row.last_landing_key);}).length,
      leadsWithSource:leads.filter(function(row){return!!safeString_(row.source);}).length,
      leadsWithLastSource:leads.filter(function(row){return!!safeString_(row.last_source);}).length,
      leadsWithVisitor:leads.filter(function(row){return!!safeString_(row.visitor_id);}).length,
      leadsWithSession:linkedGlobal.withSession,
      linkedLeadSessions:linkedGlobal.linked,
      sessionCoverage:linkedGlobal.coverage,
      publishedLandings:landings.filter(function(row){return safeString_(row.status)===APP.STATUS.PUBLISHED&&!safeString_(row.archived_at);}).length
    }
  };
}
