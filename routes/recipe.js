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

exports.addfav = function (req, res){
	Recipe.find({'_id': req.body.id}).exec(function (err, docs){
		User.find({username:req.user.username}).sort().exec(function (err, mem){
			var fav_list = mem[0].favorites
				, add = true;

			if (fav_list){
				if (fav_list.length > 0){
					for (var i=0; i<fav_list.length; i++){
						if (req.body.id == fav_list[i]._id){
							add = false;
							break;
						};
					};
				};

				if (add == true){
					var new_fav = fav_list.push(docs[0])
						, up_score = docs[0].counter + 1;
					console.log(new_fav);
					console.log(docs[0]);
					console.log(fav_list);
					User.update({username:req.user.username}, {favorites: fav_list.push(docs[0])}, function(){
						Recipe.update({'_id': req.body.id}, {counter: up_score}, function() {
							User.find({username:req.user.username}).exec(function (err, newuse){
								console.log(newuse);
								req.user = newuse[0];
								console.log('Favorite Added');
								res.redirect('/profile');
						});
						});
					});
				};
			};
		});
	});
};