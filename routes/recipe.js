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
		, image = req.body.image
		, tags = req.body.tags
		, ing = req.body.ingredients
		, des = req.body.description;
	console.log(recipe);
	res.redirect('/');
};