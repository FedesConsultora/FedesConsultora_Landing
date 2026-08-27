function saveTracking_(data) {
  data=data||{};
  ensureAnalyticsDimensionsSchema_(false);

  var record={
    category:safeString_(data.category),
    label:safeString_(data.label),
    value:safeString_(data.value),
    page_path:safeString_(data.url||data.pagePath||data.page_path),
    campaign_key:safeString_(data.campaign_key||data.campaignKey),
    landing_key:safeString_(data.landing_key||data.landingKey),
    visitor_id:safeString_(data.visitor_id||data.visitorId),
    session_id:safeString_(data.session_id||data.sessionId),
    source:safeString_(data.source)||'landing',
    utm_source:safeString_(data.utm_source||data.utmSource),
    utm_medium:safeString_(data.utm_medium||data.utmMedium),
    utm_campaign:safeString_(data.utm_campaign||data.utmCampaign),
    utm_content:safeString_(data.utm_content||data.utmContent),
    metadata_json:jsonStringify_(data)
  };

  var dimensions=analyticsDimensionPatch_(record);
  Object.keys(dimensions).forEach(function(field){
    if(!safeString_(record[field]))record[field]=dimensions[field];
  });

  return dbInsert_(APP.SHEETS.ANALYTICS,record);
}
