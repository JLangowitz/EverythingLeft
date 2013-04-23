//chosenHandle.js

$(document).ready(function() {

	$('.chzn-select').chosen();

	$('#modalOpen').click(function() {
		$('div.alert').remove();
		$('#tagName').val('');
	});

	$('.tagPost').click(function() {
		console.log($('#tagName').val());

		if ($('#tagName').val().length > 0) {

			var name = $('#tagName').val(),
				category = $('#tagCategory').val();

			$.post('/new/tag', {
				name: name,
				category: category
			}, function(err) {
				if (err) {
					$('.modal-body').append("<div class='alert alert-error'>"+
						"<button type='button' class='close' data-dismiss='alert'>&times;"+
						"</button><strong>Try Again </strong>"+
						"Looks like you didn't enter anything</div>");
				}
				else {
					$('.modal-body').append("<div class='alert alert-success'>"+
						"<button type='button' class='close' data-dismiss='alert'>&times;"+
						"</button><strong>Success! </strong>"+
						'New Tag: '+name+
						"</div>");
					setTimeout(function(){$('.modal').modal('toggle')}, 2000);

				}
			});
		}
		else {

			$('.alert').remove();

			$('.modal-body').append("<div class='alert alert-error'>"+
									"<button type='button' class='close' data-dismiss='alert'>&times;"+
									"</button><strong>Try Again </strong>"+
									"Looks like you didn't enter anything</div>");

			setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);

		}
	});

});