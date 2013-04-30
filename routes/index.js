var Models = require('../models/models')
	, Recipe = Models.recipe;
/*
 * GET home page.
 */

exports.index = function(req, res){
	// console.log(req.session);
	Recipe.find().sort('counter').exec(function (err, top){
		if (err)
			console.log("Error in Finding Top Recipe");

		Recipe.find().sort('timestamp').exec(function (err, newest){
			if (err)
				console.log("Error in Finding New Recipes")

			res.render('index', 
				{ title: 'Everything Left', 
				dietary: req.session.dietary, 
				cuisines: req.session.cuisines, 
				flavors: req.session.flavors,
				top_recipes: top,
				newest_recipes: newest });
		});
	});
};