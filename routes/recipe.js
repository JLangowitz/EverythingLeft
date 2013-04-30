var Models = require('../models/models')
	, Recipe = Models.recipe;

exports.addform = function(req, res){
	res.render('add_new', 
  		{ title: 'Everything Left', 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors });
};

exports.make_new = function(req, res){
	var new_name = req.body.name
		, new_image = req.body.image
		, new_tags = req.body.tags
		, new_ing = req.body.ingredients
		, new_des = req.body.description;
	console.log(recipe);

	var newRecipe = Recipe({
		name: new_name,
		image_url: new_image,
		ingredients: new_ing,
		description: new_des,
		counter: 0,
		tags: new_tags
		timestamp: new Date().getTime()
		});
	newRecipe.save(function(err) {
		if (err)
			return console.log("Unable to save New Recipe", err);
		res.redirect('/');
	});
};