function adminRowsFromSheetNumbers_(sheet,headers,rowNumbers) {
  var unique={};
  (rowNumbers||[]).forEach(function(rowNumber){
    var n=safeNumber_(rowNumber,0);
    if(n>=2)unique[n]=true;
  });
  var numbers=Object.keys(unique).map(Number).sort(function(a,b){return a-b;});
  if(!numbers.length)return[];

  var groups=[];
  var start=numbers[0],previous=numbers[0];
  for(var i=1;i<numbers.length;i++){
    var current=numbers[i];
    if(current===previous+1){previous=current;continue;}
    groups.push({start:start,end:previous});
    start=current;previous=current;
  }
  groups.push({start:start,end:previous});

  var rows=[];
  groups.forEach(function(group){
    var values=sheet.getRange(group.start,1,group.end-group.start+1,headers.length).getValues();
    values.forEach(function(raw){
      var row={};
      headers.forEach(function(header,index){row[header]=normalizeCellValue_(raw[index]);});
      rows.push(row);
    });
  });
  return rows;
}

function adminFindRowsByExactFields_(sheetName,criteria) {
  var sheet=getSpreadsheet_().getSheetByName(sheetName);
  if(!sheet||sheet.getLastRow()<2)return[];
  var headers=dbHeaders_(sheet);
  var rowNumbers=[];

  (criteria||[]).forEach(function(criterion){
    var field=safeString_(criterion&&criterion.field);
    var value=safeString_(criterion&&criterion.value);
    if(!field||!value)return;
    var index=headers.indexOf(field);
    if(index<0)return;
    var range=sheet.getRange(2,index+1,sheet.getLastRow()-1,1);
    var matches=range.createTextFinder(value).matchEntireCell(true).findAll();
    matches.forEach(function(cell){rowNumbers.push(cell.getRow());});
  });

  return adminRowsFromSheetNumbers_(sheet,headers,rowNumbers);
}
