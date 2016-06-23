i8n = null;
function getResource(lang){
	var lg = lang.substring(0,2);
	$.ajaxSetup({ scriptCharset: "utf-8" , contentType: "application/json; charset=utf-8"});
	$.ajax({
		url : 'ajax/'+lg+'/i8n.json',
		type : "GET",
		async : false,
		error : function(xhr,status){
			if( lg !== 'en' )
				getResource('fr');
		},
		success : function(res){
			i8n = res;
		}
	});

}

function getQueryString(){
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	} 
	return query_string;
}

function getProperty(val){
	// get all value under #{}
	var tab=val.match(/#{.*}/g);
	var res = val;
	if( tab && tab.length!=0 ){
		for(var i=0; i<tab.length;i++){
			var item = tab[i].substring(2,tab[i].length-1);	
			res = res.replace("#{"+item+"}",(i8n && i8n[item])? i8n[item]:item);
		}
	}
	return res;
}
function getData(name){
	if( !i8n ){
		var queryString = getQueryString();
		var lang = queryString['lang']|| 'fr'
		getResource(lang);
	}
	$.ajax({
		url : 'ajax/data/'+name+'.json',
		type : "GET",
		error : function(xhr,status){
			console.log("status "+status);
		},
		success : function(res){
			window[res.display](res);
		}
	});
}


function displayRichText(res){
	if(res && res.data && res.data.length!=0 ){
		$("#"+res.id).html('');
		var html = "";
		for(var i=0;i<res.data.length;i++){
			var item = res.data[i];
			html+="<h2>"+getProperty(item.title)+"</h2></br>";
			for(var j=0;j<item.content.length;j++){
				html+=getProperty(item.content[j]);
			}
			html+="</br>";
			html+=getProperty(item.text)+"</br>";
		}
		$('#'+res.id).html(html);
	}
}

function displayTable(res){ 	
	if(res && res.data && res.data.length!=0 ){
		$("#"+res.id).html('');
		var html = "<table>";
		for(var i=0;i<res.data.length;i++) {
			var item = res.data[i];
			var j=0;
			html+="<tr>";
			if( item.length != 1  ){

				while(j<res.cols && j<item.length){
					html+="<td>"+getProperty(item[j])+"</td>";
					j++;
				}
				while(j<res.cols){
					html+="<td></td>";
					j++;
				}
			}else{
				if( item[0] === "hr" )
					html+="<td style='text-align:center' colspan="+res.cols+"><hr></td>";
				else
					html+="<td style='text-align:center' colspan="+res.cols+">"+getProperty(item[0])+"</td>";
			}
			html+="</tr>";
		}
		
		html+="</table>";
		$('#'+res.id).html(html);
	}
}
function displayText(res){ 
	if(res && res.data && res.data){
		$("#"+res.id).html('');
		var html = "";
		html+=getProperty(res.data);
		html+="";
		$('#'+res.id).html(html);
	}
}

function getPage(id){
	$('.container').hide();
	$.get('ajax/'+id+'.html', function(data) {
		$('.container').html(data);
	});
	$('.container').show();
}
function displayHeader(res){ 
	if(res.data &&  res.data.length != 0 ){
		$('#'+res.id).html('');
		var html = '';
		for(var i=0;i<res.data.length;i++){
			var item = res.data[i];
			html+="<a class=\"menu\" id="+item.link+" href='#' onClick='getPage(\""+item.link+"\")' class='btn ui-corner-all'> "+getProperty(item.text)+" </a> &nbsp;";
		}
		$('#'+res.id).html(html); 
	}
}
