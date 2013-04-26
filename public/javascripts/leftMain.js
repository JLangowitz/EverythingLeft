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
			},
				function(err){
					if (err){
						// do shit
					}
					else{
						$.get('/user/multiselect/update', function(data){
							$('#multiselect').html(data);
						})
					}
				});

			$('.modal-body').append("<div class='alert'><button type='button' class='close' data-dismiss='alert'>&times;</button><strong>Warning!</strong> Best check yo self, you're not looking too good.</div>");

			setTimeout(function(){$('.modal').modal('toggle')}, 2000)

		}
		else {
			console.log('done goofed')
		}
	});

});