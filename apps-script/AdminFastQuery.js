function adminQueryHasActiveFilters_(query) {
  var filters=(query&&query.filters)||{};
  return Object.keys(filters).some(function(key){
    var value=filters[key];
    if(Array.isArray(value))return value.length>0;
    return value!==undefined&&value!==null&&String(value)!=='';
  });
}

function adminFastFacetValues_(sheet,headers,fields,cacheKey) {
  var cache=CacheService.getScriptCache();
  var raw=cache.get(cacheKey);
  if(raw){
    var parsed=jsonParse_(raw,null);
    if(parsed&&typeof parsed==='object')return parsed;
  }

  var lastRow=sheet.getLastRow();
  var out={};
  var descriptors=[];
  (fields||[]).forEach(function(field){
    var idx=headers.indexOf(field);
    if(idx<0||lastRow<2){out[field]=[];return;}
    descriptors.push({field:field,index:idx});
  });

  if(descriptors.length){
    var minIndex=Math.min.apply(null,descriptors.map(function(item){return item.index;}));
    var maxIndex=Math.max.apply(null,descriptors.map(function(item){return item.index;}));
    var values=sheet.getRange(2,minIndex+1,lastRow-1,maxIndex-minIndex+1).getValues();
    var seenByField={};
    descriptors.forEach(function(item){seenByField[item.field]={};});

    values.forEach(function(row){
      descriptors.forEach(function(item){
        var normalized=normalizeCellValue_(row[item.index-minIndex]);
        var value=String(normalized===undefined?'':normalized);
        if(value)seenByField[item.field][value]=true;
      });
    });

    descriptors.forEach(function(item){out[item.field]=Object.keys(seenByField[item.field]).sort();});
  }

  try{cache.put(cacheKey,jsonStringify_(out),300);}catch(err){/* best effort */}
  return out;
}

function adminFastFacetFields_(tableKey,def) {
  var fields=(def.filters||[]).slice();
  if(safeString_(tableKey)==='analytics'){
    ['campaign_key','landing_key','utm_source','utm_medium','utm_campaign'].forEach(function(field){if(fields.indexOf(field)<0)fields.push(field);});
  }
  return fields;
}

function adminQueryAppendOnlyPage_(token,tableKey,query) {
  requireAdminSession_(token);
  var def=adminRequireTable_(tableKey);
  var q=query||{};
  var sheet=getSpreadsheet_().getSheetByName(def.sheet);
  if(!sheet)return{success:true,tableKey:tableKey,total:0,page:1,pageSize:25,pages:1,rows:[],facets:{},fastPath:true};

  var headers=dbHeaders_(sheet);
  var total=Math.max(0,sheet.getLastRow()-1);
  var pageSize=Math.min(100,Math.max(10,safeNumber_(q.pageSize,25)));
  var pages=Math.max(1,Math.ceil(total/pageSize));
  var page=Math.min(pages,Math.max(1,safeNumber_(q.page,1)));
  var offset=(page-1)*pageSize;
  var count=Math.max(0,Math.min(pageSize,total-offset));
  var rows=[];

  if(count>0){
    var firstDataIndex=total-(offset+count);
    var rowNumber=2+firstDataIndex;
    var values=sheet.getRange(rowNumber,1,count,headers.length).getValues();
    rows=values.map(function(valuesRow){
      var row={};
      headers.forEach(function(header,index){row[header]=normalizeCellValue_(valuesRow[index]);});
      return adminListProjection_(def,adminSanitizeRowForUi_(def,row),tableKey);
    }).reverse();
  }

  var facetFields=adminFastFacetFields_(tableKey,def);
  var facets=adminFastFacetValues_(sheet,headers,facetFields,'admin_facets:'+tableKey+':'+total+':'+facetFields.join(','));
  return {success:true,tableKey:tableKey,total:total,page:page,pageSize:pageSize,pages:pages,rows:rows,facets:facets,fastPath:true};
}

function adminQueryTableFast_(token,tableKey,query) {
  var key=safeString_(tableKey);
  var q=query||{};
  if(key==='analytics')ensureAnalyticsDimensionsSchema_(false);
  var appendOnly={analytics:true,audit:true,leadEvents:true};
  var defaultSort=!safeString_(q.sortBy)||safeString_(q.sortBy)==='created_at';
  var descending=!safeString_(q.sortDir)||safeString_(q.sortDir).toLowerCase()==='desc';
  var canFast=!!appendOnly[key]&&
    !safeString_(q.search)&&
    !adminQueryHasActiveFilters_(q)&&
    !safeString_(q.dateFrom)&&
    !safeString_(q.dateTo)&&
    !safeBoolean_(q.includeArchived)&&
    defaultSort&&descending;

  // El primer ingreso a Analítica normaliza el histórico una sola vez. No se hace
  // durante login para no penalizar el camino crítico del administrador.
  if(key==='analytics'&&systemGet_(ANALYTICS_DIMENSIONS_BACKFILL_KEY)!=='done')backfillAnalyticsDimensions_();

  if(canFast)return adminQueryAppendOnlyPage_(token,key,q);
  return adminQueryTableList_(token,key,q);
}
