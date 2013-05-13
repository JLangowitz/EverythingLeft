var Models = require('../models/models')
	, Recipe = Models.recipe;
/*
 * GET home page.
 */

// handle home page information
exports.index = function(req, res){
	Recipe.find().sort({'counter':-1}).limit(10).exec(function (err, top){
		if (err)
			console.log("Error in Finding Top Recipe");

		Recipe.find().sort({'timestamp':-1}).limit(5).exec(function (err, newest){
			if (err)
				console.log("Error in Finding New Recipes")

			for (i=0; i<newest.length; i++) {
				console.log(newest[i].timestamp);
			}

			res.render('index', 
				{ title: 'Everything Left', 
				dietary: req.session.dietarydiv,
				cuisines: req.session.cuisines, 
				flavors: req.session.flavors,
				top_recipes: top,
				newest_recipes: newest });
		});
	});
};