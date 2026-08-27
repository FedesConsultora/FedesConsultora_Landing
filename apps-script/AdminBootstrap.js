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

function adminGetOperationalInsights_(token) {
  requireAdminSession_(token);
  // Dashboard ya leyó estas colecciones durante el mismo request. dbReadAll_ reutiliza
  // la caché por ejecución, por lo que estas métricas no vuelven a golpear Sheets.
  var analytics=dbReadAll_(APP.SHEETS.ANALYTICS,{includeArchived:true});
  var leads=dbReadAll_(APP.SHEETS.LEADS);
  var contacts=dbReadAll_(APP.SHEETS.CONTACTS);
  var cutoff=Date.now()-30*24*60*60*1000;
  var analytics30=analytics.filter(function(row){var t=Date.parse(row.created_at||'');return isFinite(t)&&t>=cutoff;});

  return{
    success:true,
    analytics:{
      total:analytics.length,
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
  var workspace=adminGetWorkspaceReact_(token);
  var dashboard=adminGetDashboardOverview_(token);
  var insights=adminGetOperationalInsights_(token);
  return {
    success:true,
    workspace:workspace,
    dashboard:dashboard,
    insights:insights,
    meta:{
      generatedAt:nowIso_(),
      elapsedMs:Date.now()-started,
      appVersion:APP.VERSION,
      schemaVersion:APP.SCHEMA_VERSION
    }
  };
}

function adminGetOverviewBundle_(token) {
  requireAdminSession_(token);
  var started=Date.now();
  return {
    success:true,
    dashboard:adminGetDashboardOverview_(token),
    insights:adminGetOperationalInsights_(token),
    meta:{
      generatedAt:nowIso_(),
      elapsedMs:Date.now()-started,
      appVersion:APP.VERSION,
      schemaVersion:APP.SCHEMA_VERSION
    }
  };
}
