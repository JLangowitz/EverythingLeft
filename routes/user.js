var Models = require('../models/models')
	, User = Models.user
	, Tag = Models.tag;

/*
 * GET users listing.
 */

var yummlyID = '45928695',
    yummlyKEY = '32e141669097e9e4be73c86737f3bd3d';

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res) {
	res.render('login', 
		{title: "Sign In", 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors});
};

exports.profile = function(req, res){
	var prefs = req.user.preferences
		,favs = req.user.favorites;
	if (prefs.length == 0){
		prefs = ["You do not have any preferences yet!"];
	}
	if (favs.length == 0){
		favs = ["You do not have any favorites yet!"];
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
	res.render('search', {
		title: "Everything Left", 
		dietary: req.session.dietary, 
		cuisines: req.session.cuisines, 
		flavors: req.session.flavors
	});
}

exports.prefs = function(req, res) {
	req.user.preferred_categories=req.body.categories;
	req.user.save(function(err){
		if (err){
			res.send(err);
			return console.log('error', err);
		}
		res.send(err);
	});
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
	console.log(req.body);
	User.findOne({username:req.body.username}).exec(function(err,user){
		console.log('user');
		console.log(user);
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
	// console.log(req.body);
	Tag.findOne({name:req.body.name}).exec(function(err,tag){
		if (err){
			res.send(err);
			return console.log(err);
		}
		if (!tag){
			var dbTag = new Tag({name:req.body.name, category:req.body.category});
			// console.log(dbTag);
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
		// console.log(tags);
		for (var i = 0; i < tags.length; i++) {
			// console.log(tags[i].category);
			if (tags[i].category=='Dietary Restriction'){
				// console.log('in if');	
				req.session.dietary.push(tags[i]);
				// console.log(req.session.dietary);
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