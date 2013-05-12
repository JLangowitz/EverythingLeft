// Called from recipe add page to create a recipe

$(document).ready(function(){
	if (readyFired) return;

	$('#makenew').submit(function() {
		var name = $('#name').val()
			, url = $('#url').val()
			, tags = $('#new-recipe-multiselect').children('.multiselect').val()
			, ingred = $('#ingred').val()
			, description = $('#descript').val();
		$.post('/addrecipe/new', {name: name, image: url, tags: tags, ingredients: ingred.split(","), description: description}, function(err){
			if(err){
				console.log('Unable to Make New Recipe');
			};
			window.location = '/';
		});
		return false;
	});

	$('#fav').click(function (){
		console.log("clicked");
		var adj = $(this).attr('recipeId')
		$.post('/addfav', {id: adj}, function(){
			window.location.reload();
		});
	});

});