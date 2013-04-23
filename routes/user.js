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
	User.find({email:req.user.email}).sort().exec(function (err, docs){
		if (err)
			return console.log("Cannot find user")
		var prefs = docs[0].preferences
			, favs = docs[0].favorites;
		if (prefs.length == 0){
			prefs = ["You do not have any preferences yet!"];
		}
		if (favs.length == 0){
			favs = ["You do not have any favorites yet!"];
		}
		res.render('profile', {title: "My Profile", preferences: prefs, favorites: favs});
	});
};

exports.search = function(req, res) {
	res.render('search', {
		title: "Search for new recipes!"
	});
}

exports.settings = function(req, res) {
    res.render('user', {title: 'Profile', prefs: JSON.stringify(req.user.preferred_categories)})
};

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

//Adding a category/tag
exports.addcat = function(req, res){
	res.render('tags', {title: 'Everything Left'});
};
