var Models = require('../models/models')
	, User = Models.user
	, Tags = Models.tags;

/*
 * GET users listing.
 */

var yummlyID = '45928695',
    yummlyKEY = '32e141669097e9e4be73c86737f3bd3d';

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res) {
	res.render('login', {title: "Sign In"});
};

exports.profile = function(req, res){
	var prefs = req.user.preferences
		, favs = req.user.favorites;
	if (prefs.length == 0){
		prefs = ["You do not have any preferences yet!"];
	}
	if (favs.length == 0){
		favs = ["You do not have any favorites yet!"];
	}
	res.render('profile', {title: "My Profile", preferences: prefs, favorites: favs});
};

exports.search = function(req, res) {
	res.render('search', {
		title: "Everything Left"
	});
}

/*exports.settings = function(req, res) {
    res.render('profile', {title: 'Profile', prefs: JSON.stringify(req.user.preferred_categories)})
};*/

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
	res.render('username', {title: '', error: ''});
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
