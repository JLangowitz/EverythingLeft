var Models = require('../models/models')
	, Tag = Models.tag
	, Recipe = Models.recipe
	, User = Models.user;

exports.addform = function(req, res){
	res.render('add_new', 
  		{ title: 'Everything Left', 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors });
};

exports.recipepage = function (req, res){
	Recipe.find({'_id':req.params.recipe}).sort().exec(function (err, docs){
		res.render('recipe', 
			{title: 'Everything Left', 
			dietary: req.session.dietary, 
			cuisines: req.session.cuisines, 
			flavors: req.session.flavors,
			recipe: docs[0],
			ingredients: docs[0].ingredients});
	});
};

//POST functions
exports.makenew = function(req, res){

	Recipe.findOne({name:req.body.name}).exec(function(err, recipe){
		if (recipe){
			res.send({err:'Error saving recipe. A recipe with this name is already in our database.'});
			return console.log('recipe already exists');
		}
		var new_name = req.body.name
			, new_image_large = req.body.imageLarge||req.body.image
			, new_image_small = req.body.imageSmall||req.body.image
			, new_tags = req.body.tags
			, new_ing = req.body.ingredients
			, new_url = req.body.url
			, new_des = req.body.description;
		Tag.find({"name":{$in:new_tags}}).exec(function (err, tags){

			var newRecipe = Recipe({
				name: new_name,
				image_large: new_image_large,
				image_small: new_image_small,
				ingredients: new_ing,
				description: new_des,
				counter: 0,
				tags: tags,
				url: new_url,
				timestamp: new Date().getTime()
				});
			newRecipe.save(function(err) {
				if (err){	
					res.send({err:"Error saving recipe. Please try again."});
					return console.log("Unable to save New Recipe", err);
				}
				res.send({id:newRecipe._id});
			});
		});
	});
};

exports.search = function(req, res){
	Tag.find({'name':{$in:req.query.tags}}).exec(function(err,tags){
		if (err){
			res.send(err);
			return console.log(err);
		}
		Recipe.find().populate('tags').exec(function(err,recipes){
			if (err){
				res.send(err);
				return console.log(err);
			}
			User.findOne({'username':req.user.username}).populate('preferences').exec(function(err,user){
				if (err){
					res.send(err);
					return console.log(err);
				}
				var recipeMatches = [];
				for (var i = 0; i < recipes.length; i++) {
					if (recipes[i].name.toLowerCase().indexOf(req.query.recipeName.toLowerCase()) != -1) recipeMatches.unshift(recipes[i]);
					if (recipes[i].tags){
						for (var j = 0; j < recipes[i].tags.length; j++) {
							if (user.preferences){
								for (var k = 0; k < user.preferences.length; k++) {
									if (user.preferences[k]==recipes[i].tags[j]){
										recipeMatches.push(recipes[i]);
									}
								};
							}
						};
					}
				};
				if (recipeMatches.length==0) recipeMatches=recipes;
				// req.session.databaseSearch=recipeMatches;
				res.render('_recipes',
			  		{ title: 'Everything Left', 
					dietary: req.session.dietary, 
					cuisines: req.session.cuisines, 
					flavors: req.session.flavors,
					recipes: recipeMatches });
			});
		});
	});
}

exports.addfav = function (req, res){
	Recipe.findOne({'_id': req.body.id}).exec(function (err, recipe){
		var fav_list = req.user.favorites
				, add = true;

			//Sweep through favorite list to confirm object is not already there
			if (fav_list){
				if (fav_list.length > 0){
					for (var i=0; i<fav_list.length; i++){
						if (req.body.id == fav_list[i]){
							//If it is present, do not add
							add = false;
							break;
						};
					};
				};

				if (add == true){
					var up_score = recipe.counter + 1
						, temp = req.user.favorites.push(recipe);

					User.update({'username':req.user.username}, {$push: {'favorites': recipe}}, function(){
						Recipe.update({'_id': req.body.id}, {counter: up_score}, function() {
							User.findOne({username:req.user.username}).exec(function (err, newuse){
								req.user = newuse;
								res.redirect('/profile');
							});
						});
					});
				};
			};
	});
};
