function adminGetBootstrapBundle_(token) {
  requireAdminSession_(token);
  var started=Date.now();
  var workspace=adminGetWorkspaceReact_(token);
  var dashboard=adminGetDashboardOverview_(token);
  var insights=adminGetInsights(token);
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
    insights:adminGetInsights(token),
    meta:{
      generatedAt:nowIso_(),
      elapsedMs:Date.now()-started,
      appVersion:APP.VERSION,
      schemaVersion:APP.SCHEMA_VERSION
    }
  };
}
