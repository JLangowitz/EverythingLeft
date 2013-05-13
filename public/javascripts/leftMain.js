// Ready function that runs on all pages, makes sure the ready functions only run once.
var readyFired = false,
	yummlyID = '45928695',
    yummlyKEY = '32e141669097e9e4be73c86737f3bd3d';

$(document).ready(function() {
	if (readyFired) return;
	readyFired = true;
	// initialize selects

	// initialize add-image popover
	$('.btn-add-image').popover({trigger: 'click', html: true, placement: 'right'});

	// initialize description popover
	$('.btn-primary').popover({trigger: 'click', html: true, placement: 'right'});

	// handle rendering description popover
	$(document).on('click', '.update-recipe',function() {
		var recipeID = $('.id-holder').attr('name'),
			description = $('textarea').val();
		$.post('/recipe/update/desc', {
			id: recipeID,
			description: description
		}, function(HTMLdata) {
			$('.description').html(HTMLdata).fadeIn('slow');
			$('.btn-primary').popover({trigger: 'click', html: true, placement: 'right'});
		});
	});

	// update image on recipe page
	$(document).on('click', '.image-button', function() {
		var recipeID = $('.id-holder').attr('name'),
			imageURL = $('textarea').val();
			$.post('/recipe/update/image', {
				id: recipeID,
				imageURL: imageURL
			}, function(HTMLdata) {
				$('.image-div').html(HTMLdata).fadeIn('slow');
				$('btn-add-image').popover({trigger: 'click', html: true, placement: 'right'});
			})
	})


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

			// remove pre-existing alert
			$('.alert').remove();

			// proceed only if there is text in input
			if ($('#tagName').val().length > 0) {

				var name = $('#tagName').val(),
					category = $('#tagCategory').val();

				// post tag to server
				$.post('/new/tag', {
					name: name,
					category: category
				}, function(err){
					if (err) {

						// add error alert to modal
						$('.modal-body').append("<div class='alert alert-error'>"+
						"<button type='button' class='close' data-dismiss='alert'>&times;"+
						"</button><strong>Try Again </strong>"+
						"Looks like you didn't enter anything</div>");
						console.log('here')
					}
					else{

						// add success notification to div
						$('.modal-body').append("<div class='alert alert-success'>"+
						"<button type='button' class='close' data-dismiss='alert'>&times;"+
						"</button><strong>Success! </strong>"+
						'New Tag: '+name+
						"</div>");
						
						// set timer to close modal
						setTimeout(function(){$('.modal').modal('toggle')}, 2000);

						// after adding tag, update all multiselect
						$.get('/multiselect/update', function(data){
								console.log('html data', data);
								$('.multiselect').html(data);
								$('.multiselect').trigger('liszt:updated');
							});
					}
				});
			}
			else {

				// if no text in input, throw error
				$('.modal-body').append("<div class='alert alert-error'>"+
										"<button type='button' class='close' data-dismiss='alert'>&times;"+
										"</button><strong>Try Again </strong>"+
										"Looks like you didn't enter anything</div>");

				// set timer to remove alert
				setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);
			}
		});
		
	});

	//handles searchpage searches
	$('#searchpage-search').submit(function() {
		if ($('#searchpage-search input').val().length !== 0 || $('.searchpage-search .multiselect').val() !== undefined) {
			console.log($('#searchpage-search input').val().length);
			console.log($('.searchpage-search .multiselect').val());
			var recipeName = $('#searchpage-search input').val().toLowerCase(),
			    yummlyBase = 'http://api.yummly.com',
			    yummlyURL = '/v1/api/recipes?_app_id='+yummlyID+'&_app_key='+yummlyKEY+'&q='+encodeURIComponent(recipeName);
			    
			    console.log('base', yummlyBase);
			    console.log('path', yummlyURL);
			    if($('#searchpage-search .multiselect').val() !== null) {
			    	var tags = $('#searchpage-search .multiselect').val(),
			    		categTags = categorizeTags(tags);
			    	yummlyURL = urlForm(yummlyURL, categTags);
			    }

			    // search yummly recipes
	    		$.get('/yummly/update', {host: yummlyBase, path: yummlyURL}, function(data) {
	    			$('.yummly').html(data);
	    			$('.btn-yummly').popover({trigger: 'click', html: true});

	    			// search database recipes
	    			$.get('/database/search',
	    				{tags:$('#searchpage-search .multiselect').val(),
	    				recipeName:recipeName},
	    			function(data){
	    				$('#databaseRecipes').html(data);

	    				$('.btn-yummly').click(function(){
	    					$(this).addClass('activeYummly');
	    					$('.btn-yummly').not(this).popover('hide');
	    					var name = $(this).parents('.well').attr('name');
							var recipeURL = 'http://api.yummly.com/v1/api/recipe/'+ name + "?_app_id="+yummlyID+"&_app_key="+yummlyKEY;
							
							// if user clicks "see more", get recipe object from yummly using recipe id
							$.ajax({
								url: recipeURL,
								dataType: 'jsonp',
								success: function(data) {
									console.log('recipe data', data);
									console.log('data type', typeof data);

									//check that an image exists
									if (data.images !== undefined && data.images.length > 0) {
										var image = data.images[0].hostedLargeUrl;
									}
									else {
										var image = '';
									}

									// get new html for yummly info popover
									$.get('/yummly/popover/update', {
										image: image,
										name: data.name,
										source: data.source,
										ingredients: data.ingredientLines
									}, function(htmlData) {
										$('.popover-content').html(htmlData);
										$('.popover-title').text(data.name)
										$('#saveRecipe').click(function(){

											// save yummly recipe to database
											$.post('/addrecipe/new',
												{name:data.name
												, imageLarge:data.images[0].hostedLargeUrl
												, imageSmall:data.images[0].hostedSmallUrl
												, url:data.source.sourceRecipeUrl
												, description:''
												, tags:tags
												, ingredients:data.ingredientLines},
											function(res){
												if (res.err){
													console.log(res.err);

													// Send error alert
													$('#errorAppendDiv').append("<div class='alert alert-error'>"+
																			"<button type='button' class='close' data-dismiss='alert'>&times;"+
																			"</button><strong>Try Again </strong>"+ res.err +
																			"</div>");

													setTimeout(function(){$('.alert').fadeOut('slow')}, 3000);

												}
												else{

													$('.alert').fadeOut('fast');

													// Send success notification
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
			return false
		}
		else {
			$('.search-alert').append("<div class='alert alert-error'>"+
										"<button type='button' class='close' data-dismiss='alert'>&times;"+
										"</button><strong>You need to enter a recipe name or some tags!</strong></div>");

			setTimeout(function(){$('.alert').fadeOut('slow')}, 2000);

			return false
		}
    	});

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

	$(document).trigger('click').find('.activeYummly').popover('hide').removeClass('activeYummly');

});