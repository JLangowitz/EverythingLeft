// Ready function that runs on all pages, makes sure the ready functions only run once.
var readyFired = false,
	yummlyID = '45928695',
    yummlyKEY = '32e141669097e9e4be73c86737f3bd3d';

$(document).ready(function() {
	if (readyFired) return;
	readyFired = true;
	// initialize selects


	// Goes to user.preselect, selects the user default preferences automatically
	$.get('/preselect', function(res){
		$('option').each(function(index,Element){
			for (var i = 0; i < res.preferences.length; i++) {
				if (res.preferences[i]==$(this).val()){
					$(this).attr('selected', 'selected');
				}
			};
		});

		//initialize chzn
		$('.chzn-select').each(function(index,Element){
			$(this).chosen({
				include_group_label_in_selected: true
			});
		});

		$('div.navbar ul.chzn-choices').attr('id', 'chzn-nav');


		//clears new modal
		$('#modalOpen').click(function() {
			$('div.alert').remove();
			$('#tagName').val('');
		});

		//handles new tag creation
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

						$.get('/multiselect/update', function(data){
								console.log('html data', data);
								$('.multiselect').html(data);
								$('.multiselect').trigger('liszt:updated');
							});
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

	//handles searchpage searches
	$('#searchpage-search').submit(function() {
		var tags = $('#searchpage-search .multiselect').val(),
		    recipeName = $('#searchpage-search input').val().toLowerCase(),
		    categTags = categorizeTags(tags),
		    yummlyURL = 'http://api.yummly.com/v1/api/recipes?_app_id='+yummlyID+'&_app_key='+yummlyKEY+'&q='+encodeURIComponent(recipeName);
		    yummlyURL = urlForm(yummlyURL, categTags);
		    console.log(yummlyURL);
	    //call ajax get @ yummly for recipes
	    $.ajax({
	    	url: yummlyURL,
	    	dataType: 'jsonp',
	    	success: function(data) {
	    		console.log('yummly results:', data);
	    		//call server get that updates yummly div
	    		$.get('/yummly/update', {recipes: [data.matches[0]]}, function(data) {
	    			$('.yummly').html(data);
	    			$('.btn-info').popover({trigger: 'click', html: true});
	    			console.log(tags);
	    			console.log(recipeName);
	    			$.get('/database/search',
	    				{tags:$('#searchpage-search .multiselect').val(),
	    				recipeName:recipeName},
	    			function(data){
	    				$('#databaseRecipes').html(data);

	    				//get recipe object from yummly using recipe id
	    				$('.btn-info').click(function(){
	    					$('.btn-info').not(this).popover('hide');
	    					var name = $(this).parents('.outlined').attr('name');
							var recipeURL = 'http://api.yummly.com/v1/api/recipe/'+ name + "?_app_id="+yummlyID+"&_app_key="+yummlyKEY;
							$.ajax({
								url: recipeURL,
								dataType: 'jsonp',
								success: function(data) {
									console.log('recipe data', data);
									console.log('data type', typeof data);
									$.get('/yummly/popover/update', {
										recipe: data
									}, function(htmlData) {
										$('.popover-content').html(htmlData);
										$('.popover-title').text(data.name)
										$('#saveRecipe').click(function(){
											$.post('/addrecipe/new',
												{name:data.name
												, imageLarge:data.images[0].hostedLargeUrl
												, imageSmall:data.images[0].hostedSmallUrl
												, url:data.source.sourceRecipeUrl
												, description:''
												, tags:[]
												, ingredients:data.ingredientLines},
											function(res){
												if (res.err){
													console.log(res.err);
													$('#errorAppendDiv').append("<div class='alert alert-error'>"+
																			"<button type='button' class='close' data-dismiss='alert'>&times;"+
																			"</button><strong>Try Again </strong>"+ res.err +
																			"</div>");

													setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);

												}
												else{
													$('#errorAppendDiv').append("<div class='alert alert-success'>"+
																			"<button type='button' class='close' data-dismiss='alert'>&times;"+
																			"</button><strong>Success </strong>"+
																			"Recipe saved</div>");

													setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);

													window.location='/recipe/'+res.id;

												}
											});
										});
									});
								}
							});
						})
	    			});
	    		});
	    	}
	    });
		return false
	})


	$('#navbar-search').submit(function() {
		var tags = $('#navbar-search .multiselect').val(),
		    recipeName = $('#navbar-search input').val().toLowerCase(),
		    categTags = categorizeTags(tags),
		    yummlyURL = 'http://api.yummly.com/v1/api/recipes?_app_id='+yummlyID+'&_app_key='+yummlyKEY+'&q='+encodeURIComponent(recipeName);
		    yummlyURL = urlForm(yummlyURL, categTags);
	    $.ajax({
	    	url: yummlyURL,
	    	dataType: 'jsonp',
	    	success: function(data) {
	    		console.log('yummly results:', data);
	    		$.get('/navbar/search', {recipes: data.matches}, function(data) {
	    			window.location='/search';
	    		});
	    	}
	    });
		return false
	})

	//give tags categories
	var categorizeTags = function(tags) {
		for (i=0;i<tags.length;i++) {
			tags[i] = {tag: tags[i], category: $('#searchpage-search .multiselect').children('optgroup:contains('+tags[i]+')').attr('label')};
		}
		return tags
	};

	//form yummly search url
	var urlForm = function(url, tags) {
		var flavors = getCategory('Favorite Flavors', tags),
			allowedFlavors = ['sweet','meaty','sour','bitter','sweet','piquant']
		for (i=0;i<flavors.length;i++) {
			if (allowedFlavors.indexOf(flavors[i].toLowerCase()) > -1) {
				url = url + '&flavor.'+flavors[i]+'.min=0.5';
			}
		}
		var restrictions = getCategory('Dietary Restrictions', tags),
			allowedDiet = [],
			allowedAllergy = [],
			excludedIngredient = [],
			allergies = ['lactose'],
			diets = ['vegetarian', 'vegan'];
		for (j=0;j<restrictions.length;j++) {
			var cur = restrictions[j];
			if (allergies.indexOf(cur) > -1) {
				allowedAllergy.push(cur)
			} else if (diets.indexOf(cur) > -1) {
				allowedDiet.push(cur)
			} else {
				excludedIngredient.push(cur);
			}
		}
		url = url + addParameter(allowedAllergy, '&allowedAllergy[]=');
		url = url + addParameter(allowedDiet, '&allowedDiet[]=');
		url = url + addParameter(excludedIngredient, '&excludedIngredient[]=');
		var cuisines = getCategory('Preferred Cuisine', tags);
		for (k=0;k<cuisines;k++) {
			url = url + '&excludedCuisine[]=cuisine^cuisine-' + cuisines[k]
		}
		return url
	}

	//get a category
	var getCategory= function(name, tags) {
		var filteredList = [];
		for (i=0;i<tags.length;i++) {
			if (tags[i].category === name) {
				filteredList.push(tags[i].tag.toLowerCase());
			}
		}
		return filteredList
	}

	//add parameter to url
	var addParameter = function(array, paramBase) {
		if (array.length > 0) {
			var paramVals = '';
			for (i=0;i<array.length;i++) {
				paramVals = paramVals + array[i] + ' ';
			}
			return paramBase + paramVals
		}
		else {
			return ''
		}
	}

});