function doGet(e) {
  dbBeginRequest_();
  try {
    e=e||{parameter:{}}; e.parameter=e.parameter||{};
    if (e.parameter.api) return handlePublicApi_(e);
    if (e.parameter.action) return handleLegacyGet_(e);
    return responseJson_({success:true,app:APP.NAME,version:APP.VERSION,api:'?api=bootstrap'});
  } finally {
    dbEndRequest_();
  }
}

function doPost(e) {
  dbBeginRequest_();
  try {
    var data=getRequestData_(e), action=safeString_((e&&e.parameter&&e.parameter.action)||data.action);
    try {
      var result;
      if (action==='adminCommand') result=handleAdminHttpCommand_(data);
      else if (action.indexOf('internal')===0) result=handleInternalApi_(Object.assign({},data,{action:action}));
      else result=handleLegacyPost_(action,data);
      return responseJson_(result);
    } catch(err){
      console.error(err);
      return responseJson_(responseError_(err.message,'POST_ERROR',500));
    }
  } finally {
    dbEndRequest_();
  }
}
