function galiciaAttributionSnapshot_(data, lead) {
  data=data||{};
  lead=lead||{};
  return {
    landingKey:safeString_(data.landingKey)||safeString_(lead.last_landing_key)||safeString_(lead.landing_key),
    source:safeString_(data.source)||safeString_(lead.last_source)||safeString_(lead.source),
    utmSource:safeString_(data.utm_source||data.utmSource)||safeString_(lead.utm_source),
    utmMedium:safeString_(data.utm_medium||data.utmMedium)||safeString_(lead.utm_medium),
    utmCampaign:safeString_(data.utm_campaign||data.utmCampaign)||safeString_(lead.utm_campaign),
    utmContent:safeString_(data.utm_content||data.utmContent)||safeString_(lead.utm_content),
    visitorId:safeString_(data.visitorId),
    sessionId:safeString_(data.sessionId),
    referrer:safeString_(data.referrer)||safeString_(lead.referrer),
    pagePath:safeString_(data.pagePath),
    at:nowIso_()
  };
}

function touchGaliciaLeadAttribution_(data, leadId) {
  data=data||{};
  var lead=resolveGaliciaLead_(safeString_(leadId||data.leadId));
  if (!lead) return null;

  var attribution=galiciaAttributionSnapshot_(data,lead);
  var metadata=leadMetadata_(lead);
  if (!metadata.firstAttribution || typeof metadata.firstAttribution!=='object' || Array.isArray(metadata.firstAttribution)) {
    metadata.firstAttribution={
      landingKey:safeString_(lead.landing_key)||attribution.landingKey,
      source:safeString_(lead.source)||attribution.source,
      utmSource:safeString_(lead.utm_source)||attribution.utmSource,
      utmMedium:safeString_(lead.utm_medium)||attribution.utmMedium,
      utmCampaign:safeString_(lead.utm_campaign)||attribution.utmCampaign,
      utmContent:safeString_(lead.utm_content)||attribution.utmContent,
      visitorId:safeString_(lead.visitor_id)||attribution.visitorId,
      sessionId:safeString_(lead.session_id)||attribution.sessionId,
      at:safeString_(lead.created_at)||attribution.at
    };
  }
  metadata.lastAttribution=attribution;
  metadata.lastLandingKey=attribution.landingKey;
  metadata.lastSource=attribution.source;

  return dbUpdateById_(APP.SHEETS.LEADS,lead.lead_id,{
    last_landing_key:attribution.landingKey||safeString_(lead.last_landing_key)||safeString_(lead.landing_key),
    last_source:attribution.source||safeString_(lead.last_source)||safeString_(lead.source),
    visitor_id:safeString_(lead.visitor_id)||attribution.visitorId,
    session_id:attribution.sessionId||safeString_(lead.session_id),
    utm_content:safeString_(lead.utm_content)||attribution.utmContent,
    metadata_json:jsonStringify_(metadata)
  });
}

function saveGaliciaLeadWithAttribution_(data) {
  data=data||{};
  var result=saveGaliciaLead_(data);
  var canonicalId=safeString_(result&&result.canonicalLeadId)||safeString_(result&&result.leadId)||safeString_(data.leadId);
  var saved=touchGaliciaLeadAttribution_(data,canonicalId);
  if (result && saved) {
    result.landingKey=safeString_(saved.landing_key)||safeString_(result.landingKey);
    result.lastLandingKey=safeString_(saved.last_landing_key);
    result.sessionId=safeString_(saved.session_id);
  }
  return result;
}

function completeGaliciaLeadWithAttribution_(data) {
  data=data||{};
  touchGaliciaLeadAttribution_(data,safeString_(data.leadId));
  return completeGaliciaLead_(data);
}
