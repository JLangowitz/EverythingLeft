var Models = require('../models/models')
	, User = Models.user
	, Tag = Models.tag
	, http = require('http');
	//, request = require('request');

// login page from get /login
exports.login = function(req, res) {
	res.render('login', 
		{title: "Sign In", 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors});
};

// sets up multiselects from get /multiselect
exports.preselect = function(req, res) {
	recipe=req.session.recipe;
	console.log(recipe)
	req.session.recipe=null;
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
		res.send({'error':'', 'preferences':preferences, 'recipe':recipe});
	});
};

// renders profile from get /profile or /settings
exports.profile = function(req, res){
	User.findOne({'email': req.user.email}).populate('favorites preferences').exec(function(err, user){
		console.log(user.preferences)
		res.render('profile', 
			{title: "My Profile",
			name: user.username,
			preferences: user.preferences, 
			recipes: user.favorites, 
			dietary: req.session.dietary, 
			cuisines: req.session.cuisines, 
			flavors: req.session.flavors});
	});
};


// renders searchpage from get /search
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

// saves preference changes from post /user/update
exports.prefs = function(req, res) {
	Tag.find({"name":{$in:req.body.tags}}).exec(function(err, tags){
		console.log(err);
		if (err&&tags){
			res.send({'err':'Error saving preferences.'});
			return console.log('error', err);
		}
		req.user.preferences = tags;
		req.user.save(function(err){
			if (err){
				res.send({'err':'Error saving preferences.'});
				return console.log('error', err);
			}
			// res.write(null)
			res.render('_preferences', {preferences:tags});
		});
	})
};

// Page to create username from get /username
exports.username = function(req, res) {
	res.render('username', 
		{title: '', 
		error: '', 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors});
};

// Updates username from post /username
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

// Makes new tag from post /new/tag
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

// updates multiselect from get /multiselect/update
exports.update = function(req, res){
  	res.render('_multiselect', 
  		{ dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors });
};

// updates session tags, used when tags are added
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

// DEPRECATED
// exports.navbarSearch = function(req, res) {
// 	req.session.search=req.query.recipes
// 	res.send();
// }

// renders yummly search results from get /yummly/update
exports.yummly_update = function(req, res) {

	var output = '';

	//get recipes from yummly
	http.get(req.query.host+req.query.path, function(response) {
  		response.setEncoding('utf8');
		response.on('data', function(chunk) {
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

// renders specific yummly results in popover from /yummly/popover/update
exports.popover_update = function(req, res) {
	res.render('_popover', {
		image: req.query.image,
		name: req.query.name,
		source: req.query.source,
		ingredients: req.query.ingredients
	})
}