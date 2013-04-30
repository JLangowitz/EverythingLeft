//chosenHandle.js
var readyFired = false,
	yummlyID = '45928695',
    yummlyKEY = '32e141669097e9e4be73c86737f3bd3d';

$(document).ready(function() {
	if (readyFired) return;
	readyFired = true;
	// initialize selects
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
								// console.log($('#multiselect'));
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
	    $.ajax({
	    	url: yummlyURL,
	    	dataType: 'jsonp',
	    	success: function(data) {
	    		console.log('yummly results:', data);
	    		$.get('/yummly/update', {recipes: data.matches}, function(data) {
	    			$('.yummly').html(data);
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
		var flavors = getCategory('Favorite Flavors', tags);
		for (i=0;i<flavors.length;i++) {
			url = url + '&flavor.'+flavors[i]+'.min=0.5';
		}
		var restrictions = getCategory('Dietary Restrictions', tags);
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

});