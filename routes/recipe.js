var Models = require('../models/models')
	, Tag = Models.tag
	, Recipe = Models.recipe;

exports.addform = function(req, res){
	res.render('add_new', 
  		{ title: 'Everything Left', 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors });
};

exports.recipepage = function (req, res){
	Recipe.find({'_id':req.params.recipe}).sort().exec(function (err, docs){
		console.log('docs', docs);
		console.log(req.params);
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
	console.log(req.body);

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
			console.log(tags);

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
	console.log(req.query);
	Tag.find({'name':{$in:req.query.tags}}).exec(function(err,tags){
		console.log(tags);
		if (err){
			res.send(err);
			return console.log(err);
		}
		// Recipe.find({$or:[{'name':req.query.recipeName},{'tags':{$in:tags}}]}).exec(function(err,recipes){
		Recipe.find().exec(function(err,recipes){
			console.log(recipes);
			req.session.databaseSearch=recipes;
			res.render('_recipes',
		  		{ title: 'Everything Left', 
				dietary: req.session.dietary, 
				cuisines: req.session.cuisines, 
				flavors: req.session.flavors,
				recipes: recipes });
		});
	});
}