$(document).ready(function(){

	var yummlyID = '45928695'
	, yummlyKEY = '32e141669097e9e4be73c86737f3bd3d'
	, yummlyURL = 'http://api.yummly.com/v1/api/recipes?_app_id='+yummlyID+'&_app_key='+yummlyKEY;

	$.getJSON(yummlyURL+'&q=onion%20soup'+'?callback=?', function(data) {
		console.log(data);
		//$.post('/disp', data);
	}).done(function() {console.log('Sucess!');})
	.fail(function() {console.log('Error');})
	.always(function() {console.log('Complete');});

});