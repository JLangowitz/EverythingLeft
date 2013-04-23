//chosenHandle.js

$(document).ready(function() {

	$('.chzn-select').chosen();

	$('#modalOpen').click(function() {
		$('div.alert').remove();
		$('#tagName').val('');
	});

	$('.tagPost').click(function() {

		$('.alert').remove();

		if ($('#tagName').val().length > 0) {

			var name = $('#tagName').val(),
				category = $('#tagCategory').val();

			$.post('/new/tag', {
				name: name,
				category: category
			}, function(err){
				if (err) {

					$('.modal-body').append("<div class='alert alert-error'>"+
					"<button type='button' class='close' data-dismiss='alert'>&times;"+
					"</button><strong>Try Again </strong>"+
					"Looks like you didn't enter anything</div>");
					console.log('here')
				}
				else{

					$('.modal-body').append("<div class='alert alert-success'>"+
					"<button type='button' class='close' data-dismiss='alert'>&times;"+
					"</button><strong>Success! </strong>"+
					'New Tag: '+name+
					"</div>");
					
					setTimeout(function(){$('.modal').modal('toggle')}, 2000);

					// $.get('/user/multiselect/update', function(data){
					// 	$('#multiselect').html(data);
					// })
				}
			});
		}
		else {
			$('.modal-body').append("<div class='alert alert-error'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Try Again </strong>"+
									"Looks like you didn't enter anything</div>");

			setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);
		}
	});

});