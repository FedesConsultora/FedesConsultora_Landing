function saveGaliciaLeadWithAttribution_(data) {
  data=data||{};
  var result=saveGaliciaLead_(data);
  var incomingContent=safeString_(data.utm_content||data.utmContent);
  if (!incomingContent) return result;

  var lead=resolveGaliciaLead_(safeString_(result&&result.canonicalLeadId)||safeString_(result&&result.leadId)||safeString_(data.leadId));
  if (!lead) return result;

  var metadata=leadMetadata_(lead);
  var lastAttribution=metadata.lastAttribution&&typeof metadata.lastAttribution==='object'&&!Array.isArray(metadata.lastAttribution)
    ? metadata.lastAttribution
    : {};
  lastAttribution.utmContent=incomingContent;
  lastAttribution.at=nowIso_();
  metadata.lastAttribution=lastAttribution;

  dbUpdateById_(APP.SHEETS.LEADS,lead.lead_id,{
    utm_content:safeString_(lead.utm_content)||incomingContent,
    metadata_json:jsonStringify_(metadata)
  });
  return result;
}
