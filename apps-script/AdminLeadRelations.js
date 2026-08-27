function adminGetLead360Connected_(token,leadId) {
  requireAdminSession_(token);
  ensureAnalyticsDimensions_(true);

  var lead=dbFindById_(APP.SHEETS.LEADS,safeString_(leadId),{includeArchived:true});
  if(!lead)throw new Error('Lead no encontrado');

  var answers=dbReadAll_(APP.SHEETS.LEAD_ANSWERS,{includeArchived:true}).filter(function(row){return safeString_(row.lead_id)===safeString_(lead.lead_id);});
  var crmEvents=dbReadAll_(APP.SHEETS.LEAD_EVENTS,{includeArchived:true}).filter(function(row){return safeString_(row.lead_id)===safeString_(lead.lead_id);});
  var mailings=dbReadAll_(APP.SHEETS.LEAD_MAILINGS,{includeArchived:true}).filter(function(row){return safeString_(row.lead_id)===safeString_(lead.lead_id);}).sort(function(a,b){return safeNumber_(a.sequence_no,0)-safeNumber_(b.sequence_no,0);});

  var first=campaignLeadFirstAttribution_(lead);
  var sessionId=safeString_(first.sessionId);
  var visitorId=safeString_(first.visitorId)||safeString_(lead.visitor_id);
  var campaignKey=safeString_(lead.campaign_key);
  var webEvents=[];

  if(sessionId||visitorId){
    var candidates=adminFindRowsByExactFields_(APP.SHEETS.ANALYTICS,[
      {field:'session_id',value:sessionId},
      {field:'visitor_id',value:visitorId}
    ]);

    webEvents=candidates.filter(function(row){
      var meta=campaignAnalyticsMeta_(row);
      var rowCampaign=safeString_(row.campaign_key)||safeString_(meta.campaign_key)||safeString_(meta.campaignKey);
      return !campaignKey||!rowCampaign||rowCampaign===campaignKey;
    }).map(function(row){
      var meta=campaignAnalyticsMeta_(row);
      return {
        event_id:'web:'+safeString_(row.event_id),
        lead_id:safeString_(lead.lead_id),
        campaign_key:safeString_(row.campaign_key)||campaignKey,
        landing_key:safeString_(row.landing_key)||safeString_(meta.landing_key)||safeString_(meta.landingKey),
        event_type:'web:'+safeString_(row.label||row.category||'interaction'),
        page_path:safeString_(row.page_path),
        source:safeString_(row.source)||safeString_(meta.source),
        metadata_json:row.metadata_json,
        created_at:row.created_at
      };
    });
  }

  var timeline=crmEvents.concat(webEvents).sort(function(a,b){return String(b.created_at||'').localeCompare(String(a.created_at||''));}).slice(0,120);

  return{
    success:true,
    lead:adminSanitizeRowForUi_(adminDefs_().leads,lead),
    answers:answers.map(function(row){return adminSanitizeRowForUi_(adminDefs_().leadAnswers,row);}),
    events:timeline.map(function(row){return adminSanitizeRowForUi_(adminDefs_().leadEvents,row);}),
    mailings:mailings.map(function(row){return adminSanitizeRowForUi_(adminDefs_().leadMailings,row);}),
    webTrace:{
      visitorId:visitorId,
      sessionId:sessionId,
      interactions:webEvents.length,
      linkedBy:visitorId?'visitor_id':sessionId?'session_id':''
    }
  };
}
