$(document).ready(function(){
	if (readyFired) return;
	console.log('go');
	$('#settings').submit(function () {
  		var tagNames = $('#settings .multiselect').val();
  		console.log(tagNames);
		$.post("/user/update", { "tags": tagNames },
			function(err){
		        if (err){
		        	console.log(err);
		        	$('.alert-error').remove();
		 	      	$('#settings').append("<div class='alert alert-error'>"+
					"<button type='button' class='close' data-dismiss='alert'>&times;"+
					"</button><strong>Try Again </strong>"+
					err+ "</div>");
					console.log('here')
					setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);
		        }
		        else{
		           	console.log('Updates Saved');
		           	$.get('/preselect', function(res){
		           		console.log(res.preferences);
		           		$('option').each(function(index,Element){
		           			for (var i = 0; i < res.preferences.length; i++) {
		           				if (res.preferences[i]==$(this).val()){
		           					$(this).attr('selected', 'selected');
		           					break;
		           				}
	           					$(this).attr('selected', false);
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