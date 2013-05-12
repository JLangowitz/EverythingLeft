var Models = require('../models/models')
	, User = Models.user
	, Tag = Models.tag
	, http = require('http');
	//, request = require('request');

/*
 * GET users listing.
 */

exports.login = function(req, res) {
	res.render('login', 
		{title: "Sign In", 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors});
};

exports.preselect = function(req, res) {
	req.session.search=[];
	req.session.databaseSearch=[];
	User.findOne({'email':req.user.email}).populate('preferences', 'name').exec(function(err, user){
		if (err){
			res.send({'error':err});
			return console.log('error', err);
		}
		var preferences = [];
		for (var i = 0; i < user.preferences.length; i++) {
			preferences.push(user.preferences[i].name);
		};
		res.send({'error':'', 'preferences':preferences});
	});
};


exports.profile = function(req, res){
	var prefs = req.user.preferences
		,favs = req.user.favorites;
	if (prefs.length == 0){
		prefs = ["You do not have any preferences yet!"];
	}
	res.render('profile', 
		{title: "My Profile", 
		preferences: prefs, 
		favorites: favs, 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors});
};

exports.search = function(req, res) {
	var recipes = req.session.databaseSearch;
	req.session.databaseSearch=[];
	res.render('search', {
		title: "Everything Left", 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors,
		yummly: req.session.search,
		recipes: recipes
	});
}

exports.prefs = function(req, res) {
	Tag.find({"name":{$in:req.body.tags}}).exec(function(err, tags){
		console.log(err);
		if (err&&tags){
			res.send(err);
			return console.log('error', err);
		}
		req.user.preferences = tags;
		req.user.save(function(err){
			if (err){
				res.send(err);
				return console.log('error', err);
			}
			res.send(err);
		});
	})
};

exports.username = function(req, res) {
	res.render('username', 
		{title: '', 
		error: '', 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors});
};

exports.setname = function(req, res) {
	User.findOne({username:req.body.username}).exec(function(err,user){
		if (user){
			res.send('This username is taken. Please enter a unique username')
		}
		req.user.username=req.body.username;
		req.user.save(function(err){
			if (err){
				console.log(err);
				res.send(err);
			}
			res.send('');
		});
	});
};

exports.newtag = function(req, res) {
	Tag.findOne({name:req.body.name}).exec(function(err,tag){
		if (err){
			res.send(err);
			return console.log(err);
		}
		if (!tag){
			var dbTag = new Tag({name:req.body.name, category:req.body.category});
			dbTag.save(function(err){
				if (err){
					res.send(err);
					return console.log(err);
				}
				else{
					if (dbTag.category='Dietary Restrictions'){	
						req.session.dietary.push(dbTag);
						req.session.dietary.sort(function(a,b){
							return a.name>b.name;
						});
					}
					if (dbTag.category='Favorite Flavors'){	
						req.session.flavors.push(dbTag)
						req.session.flavors.sort(function(a,b){
							return a.name>b.name;
						});
					}
					if (dbTag.category='Preferred Cuisines'){	
						req.session.cuisines.push(dbTag)
						req.session.cuisines.sort(function(a,b){
							return a.name>b.name;
						});
					}	
					res.send('');
				}
			});
		}
		else{
			pullTags(req,res);
			res.send('');
		}
	});
};

exports.update = function(req, res){
  	res.render('_multiselect', 
  		{ dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors });
};

function pullTags(req, res){
	req.session.dietary=[];
	req.session.flavors=[];
	req.session.cuisines=[];
	Tag.find().sort({name:1}).exec(function(err, tags){
		for (var i = 0; i < tags.length; i++) {
			if (tags[i].category=='Dietary Restriction'){
				req.session.dietary.push(tags[i]);
			}
			if (tags[i].category=='Favorite Flavor'){	
				req.session.flavors.push(tags[i]);
			}
			if (tags[i].category=='Preferred Cuisine'){	
				req.session.cuisines.push(tags[i]);
			}
		};
	});
}

exports.navbarSearch = function(req, res) {
	req.session.search=req.query.recipes
	res.send();
}

exports.yummly_update = function(req, res) {

	console.log('query', req.query);

	var output = '';

	//get recipes from yummly
	http.get(req.query.host+req.query.path, function(response) {
		console.log('response: ', response);
  		response.setEncoding('utf8');
		response.on('data', function(chunk) {
			console.log('chunk', chunk);
			output += chunk;
		});
		response.on('end', function() {
			var obj = JSON.parse(output);
			//render partial
			res.render('_yummly', {
				yummly: obj.matches
			});
		});
	}).on('error', function(e) {
		console.log("Dat error: ", e.message)
	});

}

exports.popover_update = function(req, res) {

	var recipe = req.query.recipe;

	if (recipe.images !== undefined && recipe.images.length > 0) {
		var image = recipe.images[0].hostedLargeUrl
	}

	res.render('_popover', {
		image: reqimage,
		name: recipe.name,
		source: recipe.source,
		ingredients: recipe.ingredientLines
	})
}