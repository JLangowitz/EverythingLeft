// recipe.js
// handles routes which relate to saving, creating, and altering recipes

var Models = require('../models/models')
	, Tag = Models.tag
	, Recipe = Models.recipe
	, User = Models.user;

// renders recipe adding page from get /addrecipe
exports.addform = function(req, res){
	res.render('add_new', 
  		{ title: 'Everything Left', 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors });
};

// renders individual recipe page from get /recipe/:recipe
exports.recipepage = function (req, res){
	Recipe.find({'_id':req.params.recipe}).populate('tags').sort().exec(function (err, docs){
		req.session.recipe=docs[0];
		res.render('recipe', 
			{title: 'Everything Left', 
			dietary: req.session.dietary, 
			cuisines: req.session.cuisines, 
			flavors: req.session.flavors,
			recipe: docs[0],
			ingredients: docs[0].ingredients,
			id: req.params.recipe
		});
	});
};

// makes new recipe from post /addrecipe/new
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

// searches database from get /database/search
exports.search = function(req, res){
	console.log('search function')
	Tag.find({'name':{$in:req.query.tags}}).exec(function(err,tags){
		if (err && tags){
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
				if (!req.query.recipeName) req.query.recipeName='';
				for (var i = 0; i < recipes.length; i++) {
					if (recipes[i].name.toLowerCase().indexOf(req.query.recipeName.toLowerCase()) != -1){
						if (!tags||!recipes[i].tags){	
							recipeMatches.unshift(recipes[i]);
						}
						else {
							var match = true;
							for (var j = 0; j < tags.length; j++) {
								for (var k = 0; k < recipes[i].tags.length; k++) {
									// console.log('recipe tag',recipes[i].tags[k])
									// console.log('search tag',tags[j])
									if (tags[j].name===recipes[i].tags[k].name){
										// console.log('hit a match')
										match=true;
										break;
									}
									else{
										match=false;
										break;
									}
								}
								if(!match) break;
							}
							if(match) recipeMatches.unshift(recipes[i]);
						}
					}
				}
				// if (recipeMatches.length==0) recipeMatches=recipes;
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


// adds favorites from post /addfav
exports.addfav = function (req, res){
	console.log(req.body);
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
							res.send({'err':'You have already favorited this recipe!'});
							return console.log('already favorited');
						};
					};
				};

				if (add == true){
					recipe.counter = recipe.counter + 1;

					User.update({'username':req.user.username}, {$push: {'favorites': recipe}}, function (err){
						if(err){
							res.send({'err':'We are experiencing some technical difficulties. Please try again.'});
							return console.log (err);
						}
						recipe.save(function (err) {
							if(err){
								res.send({'err':'We are experiencing some technical difficulties. Please try again.'});
								return console.log (err);
							}
							User.findOne({username:req.user.username}).exec(function (err, newuse){
								if(err){
									res.send({'err':'We are experiencing some technical difficulties. Please try again.'});
									return console.log (err);
								}
								req.user = newuse;
								res.render('_fav_badge', {'recipe':recipe});
							});
						});
					});
				};
			};
	});
};

//update a recipe's description from post /recipe/update/desc
exports.update_desc = function(req, res) {
	Recipe.update({'_id':req.body.id}, {description: req.body.description}, function() {
		Recipe.findOne({'_id':req.body.id}).exec(function(err, found_recipe) {
			res.render('_description.jade', {
				recipe: found_recipe,
				description: req.body.description
			});
		})
	});
}

// update a recipe's image from post /recipe/update/image
exports.update_image = function(req, res) {
	Recipe.update({'_id':req.body.id}, {image_large: req.body.imageURL}, function() {
		Recipe.findOne({'_id':req.body.id}).exec(function(err, found_recipe) {
			res.render('_recipe-image.jade', {
				recipe: found_recipe
			});
		})
	});
}

// update a recipe's tags from post /recipe/update/tags
exports.update_tags = function(req, res) {
	console.log('tags', req.body.tags)
	Recipe.findOne({'_id':req.body.id}).populate('tags').exec(function(err, found_recipe) {
		Tag.find({"name":{$in:req.body.tags}}).exec(function(err, found_tags) {
			found_recipe.tags = found_tags;
			found_recipe.save(function(err) {
				if(err) {console.log('error', err)}
				else {
					res.render('_recipetags.jade', {
						recipe: found_recipe,
						dietary: req.session.dietary, 
						cuisines: req.session.cuisines, 
						flavors: req.session.flavors
					});
				}
			})
		});
	})
}
