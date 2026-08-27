function adminGetWorkspaceReact_(token) {
  ensureCampaignLandingFoundation_();
  var workspace = adminGetWorkspace(token);
  var galicia = dbFindOne_(APP.SHEETS.CAMPAIGNS, function(row){ return safeString_(row.campaign_key) === GALICIA.CAMPAIGN_KEY; }, {includeArchived:true});
  if (galicia) ensureGaliciaCampaignPath_(galicia);

  var leads = workspace.tables && workspace.tables.leads;
  if (leads && leads.fields) {
    var attributionLabels={
      landing_key:'Landing de adquisición',
      last_landing_key:'Última landing',
      source:'Origen de adquisición',
      last_source:'Último origen',
      visitor_id:'ID visitante',
      session_id:'ID sesión'
    };
    var protectedLeadFields={
      resume_expires_at:true,
      resume_token_hash:true,
      landing_key:true,
      last_landing_key:true,
      source:true,
      last_source:true,
      visitor_id:true,
      session_id:true,
      utm_source:true,
      utm_medium:true,
      utm_campaign:true,
      utm_content:true,
      referrer:true
    };

    leads.fields.forEach(function(field){
      if (attributionLabels[field.name]) field.label=attributionLabels[field.name];
      if (protectedLeadFields[field.name]) field.readOnly=true;
    });

    // El listado por defecto prioriza identidad + primera/última atribución + estado.
    // Las UTMs completas siguen disponibles en filtros, búsqueda y Vista 360° sin
    // convertir la tabla principal en una sábana horizontal.
    leads.listColumns=[
      'full_name','company','email','campaign_key','landing_key','last_landing_key',
      'source','last_source','status','classification','last_activity_at'
    ];

    ['landing_key','last_landing_key','source','last_source','utm_source','utm_medium','utm_campaign','status','stage','classification','mailing_segment','manual_review_status','owner','meeting_status'].forEach(function(field){
      if (leads.filterFields.indexOf(field)<0) leads.filterFields.push(field);
    });

    ['landing_key','last_landing_key','source','last_source','visitor_id','session_id','utm_source','utm_medium','utm_campaign','utm_content'].forEach(function(field){
      if (leads.searchFields.indexOf(field)<0) leads.searchFields.push(field);
    });
  }
  return workspace;
}

function adminQueryTableList_(token, tableKey, query) {
  requireAdminSession_(token);
  if (safeString_(tableKey)==='leads') ensureCampaignLandingFoundation_();
  var def = adminRequireTable_(tableKey);
  var q = query || {};
  var all = dbReadAll_(def.sheet, {includeArchived:true}).map(function(row){
    if (def.sheet === APP.SHEETS.MEDIA) row = repairMediaRecordPublic_(row);
    return adminSanitizeRowForUi_(def,row);
  });
  var base = all.slice();
  if (!safeBoolean_(q.includeArchived) && (SCHEMA[def.sheet] || []).indexOf('archived_at') >= 0) base = base.filter(function(row){ return !safeString_(row.archived_at); });
  var facets = {};
  var facetFields=(def.filters||[]).slice();
  if (safeString_(tableKey)==='leads') {
    ['landing_key','last_landing_key','last_source'].forEach(function(field){if(facetFields.indexOf(field)<0)facetFields.push(field);});
  }
  facetFields.forEach(function(field){var seen={};base.forEach(function(row){var value=String(row[field]===undefined?'':row[field]);if(value!=='')seen[value]=true;});facets[field]=Object.keys(seen).sort();});
  var rows = base;
  var search = safeString_(q.search).toLowerCase();
  if (search) {
    var searchFields=(def.search||[]).slice();
    if (safeString_(tableKey)==='leads') {
      ['landing_key','last_landing_key','last_source','visitor_id','session_id'].forEach(function(field){if(searchFields.indexOf(field)<0)searchFields.push(field);});
    }
    rows=rows.filter(function(row){return searchFields.some(function(field){return String(row[field]===undefined?'':row[field]).toLowerCase().indexOf(search)>=0;});});
  }
  var filters=q.filters||{};
  Object.keys(filters).forEach(function(field){var wanted=filters[field];if(wanted===undefined||wanted===null||String(wanted)==='')return;var values=Array.isArray(wanted)?wanted:String(wanted).split('|');rows=rows.filter(function(row){return values.indexOf(String(row[field]===undefined?'':row[field]))>=0;});});
  var dateField=safeString_(q.dateField)||def.dateField,from=safeString_(q.dateFrom),to=safeString_(q.dateTo);
  if(dateField&&(from||to))rows=rows.filter(function(row){var t=Date.parse(row[dateField]||'');if(!isFinite(t))return false;if(from&&t<Date.parse(from))return false;if(to){var end=Date.parse(to);if(String(to).length<=10)end+=86399999;if(t>end)return false;}return true;});
  var sortBy=safeString_(q.sortBy)||def.dateField||def.pk,sortDir=safeString_(q.sortDir).toLowerCase()==='asc'?1:-1;
  rows.sort(function(a,b){var av=a[sortBy],bv=b[sortBy],ad=Date.parse(av||''),bd=Date.parse(bv||'');if(isFinite(ad)&&isFinite(bd))return(ad-bd)*sortDir;var an=Number(av),bn=Number(bv);if(isFinite(an)&&isFinite(bn)&&String(av)!==''&&String(bv)!=='')return(an-bn)*sortDir;return String(av===undefined?'':av).localeCompare(String(bv===undefined?'':bv))*sortDir;});
  var total=rows.length,page=Math.max(1,safeNumber_(q.page,1)),pageSize=Math.min(100,Math.max(10,safeNumber_(q.pageSize,50))),start=(page-1)*pageSize;
  return {success:true,tableKey:tableKey,total:total,page:page,pageSize:pageSize,pages:Math.max(1,Math.ceil(total/pageSize)),rows:rows.slice(start,start+pageSize).map(function(row){return adminListProjection_(def,row,tableKey);}),facets:facets};
}

function adminListProjection_(def,row,tableKey){
  var out={},fields=[def.pk].concat(def.list||[]);
  if(safeString_(tableKey)==='leads'||def.sheet===APP.SHEETS.LEADS){
    fields=fields.concat(['landing_key','last_landing_key','last_source']);
  }
  if((SCHEMA[def.sheet]||[]).indexOf('archived_at')>=0)fields.push('archived_at');
  if(def.sheet===APP.SHEETS.MEDIA)fields=fields.concat(['file_id','drive_url','public_url']);
  fields.forEach(function(field){if(out[field]===undefined)out[field]=row[field];});
  return out;
}
function adminGetRecord_(token,tableKey,id){
  requireAdminSession_(token);
  var def=adminRequireTable_(tableKey),target=safeString_(id),row=dbFindOne_(def.sheet,function(item){return String(item[def.pk])===target;},{includeArchived:true});
  if(!row)throw new Error('Registro no encontrado');
  if(def.sheet===APP.SHEETS.MEDIA)row=repairMediaRecordPublic_(row);
  return{success:true,record:adminSanitizeRowForUi_(def,row)};
}
function adminCreateDataReact_(token,tableKey,record){return adminCreateData(token,tableKey,adminProtectTechnicalFields_(tableKey,record));}
function adminUpdateDataReact_(token,tableKey,id,record){return adminUpdateData(token,tableKey,id,adminProtectTechnicalFields_(tableKey,record));}
function adminProtectTechnicalFields_(tableKey,record){
  var key=safeString_(tableKey),clean=Object.assign({},record||{});
  if(key==='leads'){
    [
      'resume_token_hash','resume_expires_at','landing_key','last_landing_key','source','last_source',
      'visitor_id','session_id','utm_source','utm_medium','utm_campaign','utm_content','referrer'
    ].forEach(function(field){delete clean[field];});
  }
  if(key==='campaigns'&&safeString_(clean.campaign_key)===GALICIA.CAMPAIGN_KEY){
    clean.landing_path=GALICIA_PRODUCTION_PATH;
    clean.name=safeString_(clean.name).replace(/Banco Galicia/g,'Galicia');
    var metadata=jsonParse_(clean.metadata_json,{});
    if(!metadata||typeof metadata!=='object'||Array.isArray(metadata))metadata={};
    metadata.event=GALICIA_EVENT_NAME;
    if(!safeNumber_(metadata.maxQualifiedSlots,0))metadata.maxQualifiedSlots=10;
    clean.metadata_json=jsonStringify_(metadata);
  }
  return clean;
}
function adminRestoreDataReact_(token,tableKey,id){requireAdminSession_(token);var def=adminRequireTable_(tableKey);if(def.deleteMode!=='archive')throw new Error('Restauración no habilitada para '+def.label);var before=dbFindOne_(def.sheet,function(item){return String(item[def.pk])===String(id);},{includeArchived:true});if(!before)throw new Error('Registro no encontrado');if(!safeString_(before.archived_at))return{success:true,unchanged:true,record:adminSanitizeRowForUi_(def,before)};return adminRestoreDataSafe(token,tableKey,id);}
function adminBulkActionReact_(token,tableKey,ids,action){requireAdminSession_(token);ids=Array.isArray(ids)?ids:[];if(ids.length>100)throw new Error('Máximo 100 registros por operación');var results=[];ids.forEach(function(id){try{if(action==='archive')results.push(adminArchiveData(token,tableKey,id));else if(action==='restore')results.push(adminRestoreDataReact_(token,tableKey,id));else if(action==='delete')results.push(adminHardDeleteData(token,tableKey,id));else results.push({success:false,id:id,error:'Acción inválida'});}catch(err){results.push({success:false,id:id,error:err.message});}});return{success:true,results:results};}