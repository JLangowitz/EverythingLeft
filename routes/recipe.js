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
	var new_name = req.body.name
		, new_image = req.body.image
		, new_tags = req.body.tags
		, new_ing = req.body.ingredients
		, new_des = req.body.description;

	Tag.find({"name":{$in:new_tags}}).exec(function (err, tags){

		var newRecipe = Recipe({
			name: new_name,
			image_url: new_image,
			ingredients: new_ing,
			description: new_des,
			counter: 0,
			tags: tags,
			timestamp: new Date().getTime()
			});
		newRecipe.save(function(err) {
			if (err)
				return console.log("Unable to save New Recipe", err);
			res.redirect('/');
		});
	});
};