$(document).ready(function(){

	var yummlyID = '45928695'
	, yummlyKEY = '32e141669097e9e4be73c86737f3bd3d'
	, yummlyURL = 'http://api.yummly.com/v1/api/recipes?_app_id='+yummlyID+'&_app_key='+yummlyKEY;

	$.ajax({
		type: "GET",
		url:yummlyURL+'&q=onion%20soup',
		dataType:'jsonp',
		jsonpCallback: 'myCallback',
		success:function(data){
			console.log("Results");
			console.log(evalJSON(data));
			$.post('/list', {results: evalJSON(data.matches)});
			return false;
		}, 
		error: function(data){ console.log("You Fail") }
	});

});