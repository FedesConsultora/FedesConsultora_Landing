var ADMIN_ANALYTICS_OVERVIEW_CACHE_TTL=120;

function adminAnalyticsNormalizeDays_(days){
  var value=Math.round(safeNumber_(days,30));
  return [7,30,90].indexOf(value)>=0?value:30;
}

function adminAnalyticsReadWindow_(days){
  ensureAnalyticsDimensionsSchema_(false);
  var sheet=getSpreadsheet_().getSheetByName(APP.SHEETS.ANALYTICS);
  if(!sheet||sheet.getLastRow()<2)return[];

  var headers=dbHeaders_(sheet);
  var createdIndex=headers.indexOf('created_at');
  if(createdIndex<0)return[];

  var total=sheet.getLastRow()-1;
  var cutoff=Date.now()-adminAnalyticsNormalizeDays_(days)*24*60*60*1000;
  var dates=sheet.getRange(2,createdIndex+1,total,1).getValues();
  var first=total;
  for(var i=dates.length-1;i>=0;i--){
    var t=Date.parse(normalizeCellValue_(dates[i][0])||'');
    if(!isFinite(t)||t<cutoff){first=i+1;break;}
    first=i;
  }
  if(first>=total)return[];

  var count=total-first;
  var values=sheet.getRange(2+first,1,count,headers.length).getValues();
  return values.map(function(raw){
    var row={};
    headers.forEach(function(header,index){row[header]=normalizeCellValue_(raw[index]);});
    return row;
  });
}

function adminAnalyticsTop_(rows,field,limit){
  var counts={};
  (rows||[]).forEach(function(row){
    var value=safeString_(row&&row[field])||'Sin dato';
    counts[value]=(counts[value]||0)+1;
  });
  return Object.keys(counts).map(function(key){return{key:key,count:counts[key]};}).sort(function(a,b){return b.count-a.count;}).slice(0,limit||8);
}

function adminAnalyticsUniqueCount_(rows,field){
  var seen={};
  (rows||[]).forEach(function(row){var value=safeString_(row&&row[field]);if(value)seen[value]=true;});
  return Object.keys(seen).length;
}

function adminAnalyticsCoverage_(rows,field){
  if(!(rows||[]).length)return 0;
  var count=(rows||[]).filter(function(row){return!!safeString_(row&&row[field]);}).length;
  return Math.round(count*1000/rows.length)/10;
}

function adminAnalyticsBuildTrend_(rows,days){
  var dayCount=adminAnalyticsNormalizeDays_(days),today=new Date(),buckets={},ordered=[];
  for(var i=dayCount-1;i>=0;i--){
    var d=new Date(today.getTime()-i*24*60*60*1000);
    var key=Utilities.formatDate(d,APP.TIMEZONE,'yyyy-MM-dd');
    buckets[key]={date:key,label:Utilities.formatDate(d,APP.TIMEZONE,dayCount<=7?'EEE':'dd/MM'),events:0,sessions:{},visitors:{}};
    ordered.push(key);
  }
  (rows||[]).forEach(function(row){
    var t=Date.parse(row.created_at||'');if(!isFinite(t))return;
    var key=Utilities.formatDate(new Date(t),APP.TIMEZONE,'yyyy-MM-dd');
    var bucket=buckets[key];if(!bucket)return;
    bucket.events++;
    var session=safeString_(row.session_id);if(session)bucket.sessions[session]=true;
    var visitor=safeString_(row.visitor_id);if(visitor)bucket.visitors[visitor]=true;
  });
  return ordered.map(function(key){var bucket=buckets[key];return{date:bucket.date,label:bucket.label,events:bucket.events,sessions:Object.keys(bucket.sessions).length,visitors:Object.keys(bucket.visitors).length};});
}

function adminAnalyticsBuildHeatmap_(rows){
  var matrix=[];for(var day=0;day<7;day++){matrix[day]=[];for(var hour=0;hour<24;hour++)matrix[day][hour]=0;}
  var max=0;
  (rows||[]).forEach(function(row){
    var t=Date.parse(row.created_at||'');if(!isFinite(t))return;
    var date=new Date(t),jsDay=date.getDay(),dayIndex=(jsDay+6)%7,hour=date.getHours();
    matrix[dayIndex][hour]++;
    if(matrix[dayIndex][hour]>max)max=matrix[dayIndex][hour];
  });
  return{days:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'],hours:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],matrix:matrix,max:max};
}

function adminGetAnalyticsOverview_(token,days){
  requireAdminSession_(token);
  var resolvedDays=adminAnalyticsNormalizeDays_(days);
  var cache=CacheService.getScriptCache(),cacheKey='admin_analytics_overview:v2:'+resolvedDays+':schema-'+APP.SCHEMA_VERSION;
  var cached=cache.get(cacheKey);
  if(cached){var parsed=jsonParse_(cached,null);if(parsed)return parsed;}

  var rows=adminAnalyticsReadWindow_(resolvedDays);
  var landingViews=rows.filter(function(row){return safeString_(row.label)==='campaign_landing_view';});
  var heroClicks=rows.filter(function(row){return safeString_(row.label)==='hero_banner_click';});
  var heroImpressions=rows.filter(function(row){return safeString_(row.label)==='hero_banner_impression';});
  var campaignRows=rows.filter(function(row){return!!safeString_(row.campaign_key);});

  var result={
    success:true,
    days:resolvedDays,
    generatedAt:nowIso_(),
    stats:{
      events:rows.length,
      sessions:adminAnalyticsUniqueCount_(rows,'session_id'),
      visitors:adminAnalyticsUniqueCount_(rows,'visitor_id'),
      landingViews:landingViews.length,
      landingSessions:adminAnalyticsUniqueCount_(landingViews,'session_id'),
      heroImpressions:heroImpressions.length,
      heroClicks:heroClicks.length,
      campaigns:adminAnalyticsUniqueCount_(campaignRows,'campaign_key')
    },
    trend:adminAnalyticsBuildTrend_(rows,resolvedDays),
    heatmap:adminAnalyticsBuildHeatmap_(rows),
    top:{
      pages:adminAnalyticsTop_(rows,'page_path',8),
      sources:adminAnalyticsTop_(rows,'source',8),
      categories:adminAnalyticsTop_(rows,'category',8),
      events:adminAnalyticsTop_(rows,'label',10),
      campaigns:adminAnalyticsTop_(campaignRows,'campaign_key',8),
      landings:adminAnalyticsTop_(rows.filter(function(row){return!!safeString_(row.landing_key);}), 'landing_key',8)
    },
    coverage:{
      session:adminAnalyticsCoverage_(rows,'session_id'),
      visitor:adminAnalyticsCoverage_(rows,'visitor_id'),
      campaign:adminAnalyticsCoverage_(rows,'campaign_key'),
      landing:adminAnalyticsCoverage_(rows,'landing_key'),
      source:adminAnalyticsCoverage_(rows,'source'),
      utmCampaign:adminAnalyticsCoverage_(rows,'utm_campaign')
    }
  };

  try{cache.put(cacheKey,jsonStringify_(result),ADMIN_ANALYTICS_OVERVIEW_CACHE_TTL);}catch(err){/* best effort */}
  return result;
}
