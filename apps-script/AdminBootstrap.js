function adminCollectionHealthFast_(sheetName) {
  var sheet=getSpreadsheet_().getSheetByName(sheetName);
  if(!sheet||sheet.getLastRow()<2)return{total:0,published:0,draft:0,hidden:0};
  var headers=dbHeaders_(sheet),statusIndex=headers.indexOf('status'),total=sheet.getLastRow()-1;
  if(statusIndex<0)return{total:total,published:0,draft:0,hidden:0};
  var values=sheet.getRange(2,statusIndex+1,total,1).getValues(),published=0,draft=0,hidden=0;
  values.forEach(function(row){
    var status=safeString_(normalizeCellValue_(row[0]));
    if(status==='published')published++;
    else if(status==='draft')draft++;
    else if(status==='hidden')hidden++;
  });
  return{total:total,published:published,draft:draft,hidden:hidden};
}

function adminGetOperationalInsights_(token,analyticsWindow) {
  requireAdminSession_(token);
  var analytics30=Array.isArray(analyticsWindow)?analyticsWindow:adminAnalyticsReadWindow_(30);
  var analyticsSheet=getSpreadsheet_().getSheetByName(APP.SHEETS.ANALYTICS);
  var analyticsTotal=analyticsSheet?Math.max(0,analyticsSheet.getLastRow()-1):0;
  var leads=dbReadAll_(APP.SHEETS.LEADS);
  var contacts=dbReadAll_(APP.SHEETS.CONTACTS);

  return{
    success:true,
    analytics:{
      total:analyticsTotal,
      last30:analytics30.length,
      topPages:adminCountTop_(analytics30,'page_path',8),
      topSources:adminCountTop_(analytics30,'source',8),
      categories:adminCountTop_(analytics30,'category',8)
    },
    crm:{
      contactSources:adminCountTop_(contacts,'source',8),
      leadStages:adminCountTop_(leads,'stage',8),
      leadClassifications:adminCountTop_(leads,'classification',8),
      meetingStatuses:adminCountTop_(leads,'meeting_status',8),
      utmSources:adminCountTop_(leads,'utm_source',8),
      utmMediums:adminCountTop_(leads,'utm_medium',8),
      utmCampaigns:adminCountTop_(leads,'utm_campaign',8)
    },
    cms:{
      blog:adminCollectionHealthFast_(APP.SHEETS.BLOG),
      content:adminCollectionHealthFast_(APP.SHEETS.CONTENT),
      media:adminCollectionHealthFast_(APP.SHEETS.MEDIA),
      cases:adminCollectionHealthFast_(APP.SHEETS.CASES),
      team:adminCollectionHealthFast_(APP.SHEETS.TEAM),
      testimonials:adminCollectionHealthFast_(APP.SHEETS.TESTIMONIALS)
    }
  };
}

function adminGetBootstrapBundle_(token) {
  requireAdminSession_(token);
  var started=Date.now();
  var analytics30=adminAnalyticsReadWindow_(30);
  var workspace=adminGetWorkspaceReact_(token);
  var dashboard=adminGetDashboardOverview_(token,analytics30);
  var insights=adminGetOperationalInsights_(token,analytics30);
  return {
    success:true,
    workspace:workspace,
    dashboard:dashboard,
    insights:insights,
    meta:{
      generatedAt:nowIso_(),
      elapsedMs:Date.now()-started,
      appVersion:APP.VERSION,
      schemaVersion:APP.SCHEMA_VERSION,
      analyticsWindowDays:30
    }
  };
}

function adminGetOverviewBundle_(token) {
  requireAdminSession_(token);
  var started=Date.now();
  var analytics30=adminAnalyticsReadWindow_(30);
  return {
    success:true,
    dashboard:adminGetDashboardOverview_(token,analytics30),
    insights:adminGetOperationalInsights_(token,analytics30),
    meta:{
      generatedAt:nowIso_(),
      elapsedMs:Date.now()-started,
      appVersion:APP.VERSION,
      schemaVersion:APP.SCHEMA_VERSION,
      analyticsWindowDays:30
    }
  };
}
