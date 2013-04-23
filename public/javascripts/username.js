$(document).ready(function(){
	console.log('go');
	$('#setuser').submit(function () {
  		var username = $('#username').val()
		$.post("/username", { "username": username },
			function(err){
		        if (err){
		        	console.log(err);
		 	      	$('#error').text(err);
		 	      	$('.control-group').addClass('error')
		        }
		        else{
		           	console.log('Username Saved');
		           	window.location='/settings';
				}
		    });
		return false;
	});
});