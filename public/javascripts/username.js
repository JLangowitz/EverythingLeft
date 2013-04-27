$(document).ready(function(){
	if (readyFired) return;
	console.log('go');
	$('#setuser').submit(function () {
  		var username = $('#username').val()
		$.post("/username", { "username": username },
			function(err){
		        if (err){
		        	console.log(err);
		        	$('.alert-error').remove();
		 	      	$('#setuser').append("<div class='alert alert-error'>"+
					"<button type='button' class='close' data-dismiss='alert'>&times;"+
					"</button><strong>Try Again </strong>"+
					err+ "</div>");
					console.log('here')
					setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);
		        }
		        else{
		           	console.log('Username Saved');
		           	console.log(window.location);
		           	$('#username').val('');
		           	if (window.location.pathname!='/profile'){
		           		window.location='/profile';   		
		           	}
				}
		    });
		return false;
	});
});