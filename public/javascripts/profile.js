// Used to update default preferences of a user

$(document).ready(function(){
	if (readyFired) return;
	console.log('go');
	$('#settings').submit(function () {
  		var tagNames = $('#settings .multiselect').val();
  		console.log(tagNames);
		$.post("/user/update", { "tags": tagNames },
			function(res){
		        if (res.err){
		        	console.log(res.err);
		        	$('.alert-error').remove();
		 	      	$('#settings').append("<div class='alert alert-error'>"+
					"<button type='button' class='close' data-dismiss='alert'>&times;"+
					"</button><strong>Try Again </strong>"+
					res.err+ "</div>");
					console.log('here')
					setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);
		        }
		        else{
		        	$('.preference-partial').html(res);
		           	console.log('Updates Saved');
		           	$.get('/preselect', function(res){
		           		console.log(res.preferences);
		           		$('option').each(function(index,Element){
	           				$(this).attr('selected', false);
		           			for (var i = 0; i < res.preferences.length; i++) {
		           				if (res.preferences[i]==$(this).val()){
		           					$(this).attr('selected', 'selected');
		           				}
		           			};
		           		});


		           		$('.chzn-select').each(function(index,Element){
		           			// $(this).chosen();
		           			$(this).trigger('liszt:updated');
		           		});
		           	});
				}
		    });
		return false;
	});
});